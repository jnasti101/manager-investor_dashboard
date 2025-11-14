import { Building2, DollarSign, TrendingUp, Home } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { PropertyList } from '@/components/dashboard/property-list'
import { RecommendationsList } from '@/components/dashboard/recommendations-list'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { PortfolioCompositionChart } from '@/components/charts/portfolio-composition-chart'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCashFlowData, calculateCurrentMonthlyCashFlow, calculateMonthlyAmount } from '@/lib/cash-flow-calculator'
import { Property, FinancialMetrics, Recommendation } from '@/types'

export default async function InvestorDashboard() {
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

  // Redirect managers to their dashboard
  if (dbUser.role === 'MANAGER' || dbUser.role === 'ADVISOR') {
    redirect('/dashboard/manager')
  }

  // Fetch all properties with income and expense data
  const properties = await prisma.asset.findMany({
    where: {
      userId: dbUser.id,
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

  // Map Prisma properties to Property type for PropertyList component
  const mappedProperties: Property[] = properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.realEstateProperty ?
      `${p.realEstateProperty.address}, ${p.realEstateProperty.city}, ${p.realEstateProperty.state}` :
      'No address',
    purchasePrice: p.realEstateProperty ? Number(p.realEstateProperty.purchasePrice) : Number(p.costBasis),
    currentValue: Number(p.currentValue),
    purchaseDate: p.realEstateProperty ? new Date(p.realEstateProperty.purchaseDate) : new Date(p.createdAt),
    propertyType: (p.realEstateProperty?.propertyType.toLowerCase().replace(/_/g, '-') || 'single-family') as any,
    investorId: p.userId,
  }))

  // Calculate financial metrics for each property
  const metricsMap: Record<string, FinancialMetrics> = {}
  properties.forEach(p => {
    const reProperty = p.realEstateProperty
    if (!reProperty) return

    // Calculate monthly rent (sum of recurring income)
    const monthlyRent = p.incomeStreams.reduce((sum, income) => {
      if (income.isRecurring) {
        return sum + calculateMonthlyAmount(Number(income.amount), income.frequency)
      }
      return sum
    }, 0)

    // Calculate monthly expenses
    const monthlyExpenses = reProperty.expenses.reduce((sum, expense) => {
      if (expense.recurring) {
        return sum + Number(expense.amount)
      }
      return sum
    }, 0)

    // Calculate monthly mortgage payments
    const monthlyMortgagePayment = reProperty.mortgages.reduce((sum, m) => {
      return sum + Number(m.monthlyPayment)
    }, 0)

    // NOI = Monthly Rent - Monthly Operating Expenses (not including mortgage)
    const noi = (monthlyRent - monthlyExpenses) * 12 // Annual NOI

    // Cap Rate = NOI / Current Value
    const capRate = Number(p.currentValue) > 0 ? (noi / Number(p.currentValue)) * 100 : 0

    // Total mortgage debt
    const totalMortgageDebt = reProperty.mortgages.reduce((sum, m) => {
      return sum + Number(m.currentBalance)
    }, 0)

    // Cash invested = Purchase Price - Original Loan Amount
    const originalLoanAmount = reProperty.mortgages.reduce((sum, m) => {
      return sum + Number(m.originalAmount)
    }, 0)
    const cashInvested = Number(p.costBasis) - originalLoanAmount

    // Cash on Cash Return = Annual Cash Flow / Cash Invested
    const annualCashFlow = (monthlyRent - monthlyExpenses - monthlyMortgagePayment) * 12
    const cocReturn = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0

    // LTV = Loan Balance / Current Value
    const ltv = Number(p.currentValue) > 0 ? (totalMortgageDebt / Number(p.currentValue)) * 100 : 0

    metricsMap[p.id] = {
      propertyId: p.id,
      monthlyRent,
      monthlyExpenses: monthlyExpenses + monthlyMortgagePayment,
      noi,
      capRate,
      cocReturn,
      irr: 0, // IRR calculation is complex, leaving at 0 for now
      ltv,
    }
  })

  // Fetch recommendations (placeholder for now - no data yet)
  const recommendations: Recommendation[] = []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={dbUser.name || 'User'} userRole={dbUser.role.toLowerCase()} />

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
            <PropertyList properties={mappedProperties} metrics={metricsMap} />
          </div>
          <div>
            <RecommendationsList recommendations={recommendations} />
          </div>
        </div>
      </main>
    </div>
  )
}
