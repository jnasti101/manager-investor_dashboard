import { Building2, DollarSign, TrendingUp, Home } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { PropertyList } from '@/components/dashboard/property-list'
import { RecommendationsList } from '@/components/dashboard/recommendations-list'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { PortfolioCompositionChart } from '@/components/charts/portfolio-composition-chart'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  mockPortfolio,
  mockProperties,
  mockMetrics,
  mockRecommendations,
} from '@/lib/mock-data'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCashFlowData, calculateCurrentMonthlyCashFlow } from '@/lib/cash-flow-calculator'
import { CashFlowData } from '@/types'

export default async function InvestorDashboard() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Fetch all properties with income and expense data
  const properties = await prisma.asset.findMany({
    where: {
      userId: session.user.id,
      assetType: 'real_estate',
    },
    include: {
      realEstateProperty: {
        include: {
          expenses: true,
          mortgages: true,
        },
      },
      incomeStreams: true,
    },
  })

  // Calculate portfolio-wide cash flow data
  const allIncomeStreams = properties.flatMap(p =>
    p.incomeStreams.map(stream => ({
      amount: Number(stream.amount),
      frequency: stream.frequency,
      startDate: new Date(stream.startDate),
      endDate: stream.endDate ? new Date(stream.endDate) : null,
      isRecurring: stream.isRecurring,
    }))
  )

  const allExpenses = properties.flatMap(p => [
    ...(p.realEstateProperty?.expenses.map(expense => ({
      amount: Number(expense.amount),
      date: new Date(expense.date),
      recurring: expense.recurring,
    })) || []),
    ...(p.realEstateProperty?.mortgages.map(mortgage => ({
      amount: Number(mortgage.monthlyPayment),
      date: new Date(mortgage.startDate),
      recurring: true, // Mortgages are always recurring
    })) || [])
  ])

  const portfolioCashFlowData = generateCashFlowData(allIncomeStreams, allExpenses, 6)
  const currentCashFlow = calculateCurrentMonthlyCashFlow(allIncomeStreams, allExpenses)

  // Calculate portfolio totals
  const totalValue = properties.reduce((sum, p) => sum + Number(p.currentValue), 0)
  const totalCostBasis = properties.reduce((sum, p) => sum + (Number(p.costBasis) || 0), 0)

  // Calculate total mortgage debt
  const totalDebt = properties.reduce((sum, p) => {
    const mortgageDebt = p.realEstateProperty?.mortgages.reduce(
      (mSum, m) => mSum + Number(m.currentBalance),
      0
    ) || 0
    return sum + mortgageDebt
  }, 0)

  // Calculate total original loan amounts
  const totalOriginalLoans = properties.reduce((sum, p) => {
    const originalLoans = p.realEstateProperty?.mortgages.reduce(
      (mSum, m) => mSum + Number(m.originalAmount),
      0
    ) || 0
    return sum + originalLoans
  }, 0)

  // Calculate total income earned (sum of all recurring income over time)
  const totalIncomeEarned = properties.reduce((sum, p) => {
    const propertyIncome = p.incomeStreams.reduce((iSum, income) => {
      if (!income.isRecurring) return iSum

      const today = new Date()
      const startDate = new Date(income.startDate)
      const endDate = income.endDate ? new Date(income.endDate) : today

      // Only count active or past income streams
      if (startDate > today) return iSum

      // Calculate months of income
      const effectiveEndDate = endDate > today ? today : endDate
      const monthsOfIncome = Math.max(0,
        (effectiveEndDate.getFullYear() - startDate.getFullYear()) * 12 +
        (effectiveEndDate.getMonth() - startDate.getMonth())
      )

      // Convert to monthly and multiply by months
      const monthlyAmount = income.frequency === 'MONTHLY' ? Number(income.amount) :
                          income.frequency === 'QUARTERLY' ? Number(income.amount) / 3 :
                          income.frequency === 'ANNUALLY' ? Number(income.amount) / 12 : 0

      return iSum + (monthlyAmount * monthsOfIncome)
    }, 0)
    return sum + propertyIncome
  }, 0)

  // Equity = Total Value - Total Debt
  const totalEquity = totalValue - totalDebt

  // ROI = (Property Appreciation + Total Income) / (Purchase Price - Original Loans)
  const propertyAppreciation = totalValue - totalCostBasis
  const moneyIn = totalCostBasis - totalOriginalLoans
  const totalROI = moneyIn > 0 ? ((propertyAppreciation + totalIncomeEarned) / moneyIn) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name || 'User'} userRole={session.user.role.toLowerCase()} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Portfolio Overview</h1>
          <p className="text-gray-600">
            Track your real estate investments and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(totalValue)}
            icon={Building2}
          />
          <StatCard
            title="Monthly Cash Flow"
            value={formatCurrency(currentCashFlow.netCashFlow)}
            icon={DollarSign}
          />
          <StatCard
            title="Total ROI"
            value={formatPercentage(totalROI)}
            icon={TrendingUp}
          />
          <StatCard
            title="Properties"
            value={properties.length.toString()}
            icon={Home}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CashFlowChart data={portfolioCashFlowData} />
          <PortfolioCompositionChart
            equity={totalEquity}
            debt={totalDebt}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyList properties={mockProperties} metrics={mockMetrics} />
          </div>
          <div>
            <RecommendationsList recommendations={mockRecommendations} />
          </div>
        </div>
      </main>
    </div>
  )
}
