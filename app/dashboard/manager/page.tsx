import { Users, Building2, DollarSign, TrendingUp } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { InvestorOverviewTable } from '@/components/dashboard/investor-overview-table'
import { ActionItems } from '@/components/dashboard/action-items'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateMonthlyAmount } from '@/lib/cash-flow-calculator'

export default async function ManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!dbUser) {
    redirect('/login')
  }

  // Redirect clients to their dashboard
  if (dbUser.role === 'CLIENT') {
    redirect('/dashboard/investor')
  }

  // Fetch all investors (users with CLIENT role) and their portfolio data
  const investors = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
    },
    include: {
      assets: {
        where: {
          assetType: 'real_estate',
        },
        include: {
          realEstateProperty: {
            include: {
              mortgages: true,
              expenses: true,
            },
          },
          incomeStreams: true,
        },
      },
    },
  })

  // Calculate portfolio metrics for each investor
  const investorMetrics = investors.map(investor => {
    const properties = investor.assets
    const propertiesCount = properties.length

    // Total portfolio value
    const totalValue = properties.reduce((sum, p) => sum + Number(p.currentValue), 0)
    const totalCostBasis = properties.reduce((sum, p) => sum + Number(p.costBasis || 0), 0)

    // Calculate total mortgage debt
    const totalDebt = properties.reduce((sum, p) => {
      const mortgageDebt = p.realEstateProperty?.mortgages.reduce(
        (mSum, m) => mSum + Number(m.currentBalance),
        0
      ) || 0
      return sum + mortgageDebt
    }, 0)

    // Calculate total original loans
    const totalOriginalLoans = properties.reduce((sum, p) => {
      const originalLoans = p.realEstateProperty?.mortgages.reduce(
        (mSum, m) => mSum + Number(m.originalAmount),
        0
      ) || 0
      return sum + originalLoans
    }, 0)

    // Calculate total income earned
    const totalIncomeEarned = properties.reduce((sum, p) => {
      const propertyIncome = p.incomeStreams.reduce((iSum, income) => {
        if (!income.isRecurring) return iSum

        const today = new Date()
        const startDate = new Date(income.startDate)
        const endDate = income.endDate ? new Date(income.endDate) : today

        if (startDate > today) return iSum

        const effectiveEndDate = endDate > today ? today : endDate
        const monthsOfIncome = Math.max(0,
          (effectiveEndDate.getFullYear() - startDate.getFullYear()) * 12 +
          (effectiveEndDate.getMonth() - startDate.getMonth())
        )

        const monthlyAmount = income.frequency === 'MONTHLY' ? Number(income.amount) :
                            income.frequency === 'QUARTERLY' ? Number(income.amount) / 3 :
                            income.frequency === 'ANNUALLY' ? Number(income.amount) / 12 : 0

        return iSum + (monthlyAmount * monthsOfIncome)
      }, 0)
      return sum + propertyIncome
    }, 0)

    // Calculate monthly income
    const monthlyIncome = properties.reduce((sum, p) => {
      const propertyIncome = p.incomeStreams.reduce((iSum, income) => {
        if (income.isRecurring) {
          return iSum + calculateMonthlyAmount(Number(income.amount), income.frequency)
        }
        return iSum
      }, 0)
      return sum + propertyIncome
    }, 0)

    // Calculate ROI
    const propertyAppreciation = totalValue - totalCostBasis
    const moneyIn = totalCostBasis - totalOriginalLoans
    const totalROI = moneyIn > 0 ? ((propertyAppreciation + totalIncomeEarned) / moneyIn) * 100 : 0

    return {
      id: investor.id,
      name: investor.name || 'Unknown',
      email: investor.email,
      propertiesCount,
      totalValue,
      monthlyIncome,
      totalROI,
      status: 'active' as const, // For now, all are active
    }
  })

  // Calculate aggregate metrics
  const totalPortfolioValue = investorMetrics.reduce((sum, inv) => sum + inv.totalValue, 0)
  const totalMonthlyIncome = investorMetrics.reduce((sum, inv) => sum + inv.monthlyIncome, 0)
  const totalProperties = investorMetrics.reduce((sum, inv) => sum + inv.propertiesCount, 0)
  const avgROI = investorMetrics.length > 0
    ? investorMetrics.reduce((sum, inv) => sum + inv.totalROI, 0) / investorMetrics.length
    : 0

  // Placeholder for action items and activities
  const mockActionItems: any[] = []
  const mockActivities: any[] = []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={dbUser.name || 'Manager'} userRole={dbUser.role.toLowerCase()} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">
            Manage your investors and their portfolios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Investors"
            value={investorMetrics.length.toString()}
            icon={Users}
          />
          <StatCard
            title="Total Assets Under Management"
            value={formatCurrency(totalPortfolioValue)}
            icon={Building2}
          />
          <StatCard
            title="Total Monthly Income"
            value={formatCurrency(totalMonthlyIncome)}
            icon={DollarSign}
          />
          <StatCard
            title="Average ROI"
            value={`${avgROI.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <InvestorOverviewTable investors={investorMetrics} />
          </div>
          <div className="space-y-6">
            <ActionItems items={mockActionItems} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={mockActivities} />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Add New Property
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Create Recommendation
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Generate Report
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Invite New Investor
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
