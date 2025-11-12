import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Building2, MapPin, Calendar, TrendingUp, Edit, DollarSign, Receipt, Landmark } from 'lucide-react'
import { IncomeForm } from '@/components/properties/income-form'
import { ExpenseForm } from '@/components/properties/expense-form'
import { MortgageForm } from '@/components/properties/mortgage-form'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { generateCashFlowData } from '@/lib/cash-flow-calculator'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params

  const property = await prisma.asset.findFirst({
    where: {
      id: id,
      userId: session.user.id,
      assetType: 'real_estate',
    },
    include: {
      realEstateProperty: {
        include: {
          images: { orderBy: { order: 'asc' } },
          documents: true,
          expenses: { orderBy: { date: 'desc' } },
          mortgages: { orderBy: { startDate: 'desc' } },
        },
      },
      incomeStreams: { orderBy: { createdAt: 'desc' } },
      valuations: { orderBy: { date: 'desc' }, take: 10 },
    },
  })

  if (!property || !property.realEstateProperty) {
    notFound()
  }

  const reProperty = property.realEstateProperty
  const equity = Number(property.currentValue) - (Number(property.costBasis) || 0)
  const roi = property.costBasis
    ? ((Number(property.currentValue) - Number(property.costBasis)) / Number(property.costBasis)) * 100
    : 0

  // Calculate monthly income and expenses
  const calculateMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'MONTHLY': return amount
      case 'QUARTERLY': return amount / 3
      case 'ANNUALLY': return amount / 12
      case 'ONE_TIME': return 0
      default: return 0
    }
  }

  const monthlyIncome = property.incomeStreams.reduce((sum, income) => {
    if (income.isRecurring) {
      return sum + calculateMonthlyAmount(Number(income.amount), income.frequency)
    }
    return sum
  }, 0)

  const monthlyExpenses = reProperty.expenses.reduce((sum, expense) => {
    if (expense.recurring) {
      return sum + Number(expense.amount)
    }
    return sum
  }, 0)

  const monthlyCashFlow = monthlyIncome - monthlyExpenses

  // Generate historical cash flow data
  const cashFlowData = generateCashFlowData(
    property.incomeStreams.map(stream => ({
      amount: Number(stream.amount),
      frequency: stream.frequency,
      startDate: new Date(stream.startDate),
      endDate: stream.endDate ? new Date(stream.endDate) : null,
      isRecurring: stream.isRecurring,
    })),
    reProperty.expenses.map(expense => ({
      amount: Number(expense.amount),
      date: new Date(expense.date),
      recurring: expense.recurring,
    })),
    6 // Last 6 months
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{reProperty.address}, {reProperty.city}, {reProperty.state} {reProperty.zipCode}</span>
              </div>
            </div>
            <Link href={`/dashboard/properties/${property.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Images */}
        {reProperty.images && reProperty.images.length > 0 ? (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reProperty.images.map((image) => (
                <div key={image.id} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption || property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-24 w-24 text-indigo-400" />
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(Number(property.currentValue))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(Number(reProperty.purchasePrice))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Equity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(equity)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Cash Flow</p>
                  <p className={`text-2xl font-bold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(monthlyCashFlow)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${monthlyCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Property Type</dt>
                  <dd className="font-medium text-gray-900">
                    {reProperty.propertyType.replace(/_/g, ' ')}
                  </dd>
                </div>
                {reProperty.bedrooms && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bedrooms</dt>
                    <dd className="font-medium text-gray-900">{reProperty.bedrooms}</dd>
                  </div>
                )}
                {reProperty.bathrooms && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bathrooms</dt>
                    <dd className="font-medium text-gray-900">{Number(reProperty.bathrooms)}</dd>
                  </div>
                )}
                {reProperty.squareFeet && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Square Feet</dt>
                    <dd className="font-medium text-gray-900">
                      {reProperty.squareFeet.toLocaleString()}
                    </dd>
                  </div>
                )}
                {reProperty.yearBuilt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Year Built</dt>
                    <dd className="font-medium text-gray-900">{reProperty.yearBuilt}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">Purchase Date</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(new Date(reProperty.purchaseDate))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Purchase Price</dt>
                  <dd className="font-medium text-gray-900">
                    {formatCurrency(Number(reProperty.purchasePrice))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Current Value</dt>
                  <dd className="font-medium text-gray-900">
                    {formatCurrency(Number(property.currentValue))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Appreciation</dt>
                  <dd className="font-medium text-green-600">
                    {formatCurrency(Number(property.currentValue) - Number(reProperty.purchasePrice))}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <dt className="text-gray-900 font-semibold">Total Equity</dt>
                  <dd className="font-bold text-gray-900">
                    {formatCurrency(equity)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Chart */}
        {(property.incomeStreams.length > 0 || reProperty.expenses.length > 0) && (
          <div className="mb-8">
            <CashFlowChart data={cashFlowData} />
          </div>
        )}

        {/* Income & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income Streams */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Income Streams
              </CardTitle>
              <IncomeForm propertyId={property.id} />
            </CardHeader>
            <CardContent>
              {property.incomeStreams.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">
                  No income streams yet. Add one to track rental income or other revenue.
                </p>
              ) : (
                <div className="space-y-3">
                  {property.incomeStreams.map((income) => (
                    <div key={income.id} className="py-3 border-b last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900">{income.name}</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(Number(income.amount))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">{income.frequency.toLowerCase().replace('_', ' ')}</span>
                        {income.isRecurring && <span className="text-green-600">• Recurring</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Started: {formatDate(new Date(income.startDate))}
                        {income.endDate && ` • Ends: ${formatDate(new Date(income.endDate))}`}
                      </p>
                    </div>
                  ))}
                  <div className="pt-3 border-t-2 border-gray-200 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Monthly Income</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(monthlyIncome)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Expenses
              </CardTitle>
              <ExpenseForm propertyId={property.id} />
            </CardHeader>
            <CardContent>
              {reProperty.expenses.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">
                  No expenses yet. Track maintenance, taxes, insurance, and other costs.
                </p>
              ) : (
                <div className="space-y-3">
                  {reProperty.expenses.map((expense) => (
                    <div key={expense.id} className="py-3 border-b last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900">
                          {expense.category.replace(/_/g, ' ')}
                        </p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(Number(expense.amount))}
                        </p>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600">{expense.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{formatDate(new Date(expense.date))}</span>
                        {expense.recurring && <span className="text-orange-600">• Recurring</span>}
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t-2 border-gray-200 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Monthly Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(monthlyExpenses)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mortgages & Debt */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-600" />
              Mortgages & Debt
            </CardTitle>
            <MortgageForm propertyId={property.id} />
          </CardHeader>
          <CardContent>
            {reProperty.mortgages.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                No mortgages tracked yet. Add mortgage details to track debt and payments.
              </p>
            ) : (
              <div className="space-y-4">
                {reProperty.mortgages.map((mortgage) => {
                  const monthsElapsed = Math.floor(
                    (new Date().getTime() - new Date(mortgage.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
                  )
                  const remainingMonths = mortgage.termMonths - monthsElapsed
                  const progressPercent = (monthsElapsed / mortgage.termMonths) * 100

                  return (
                    <div key={mortgage.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{mortgage.lender}</h4>
                          <p className="text-sm text-gray-600 capitalize">{mortgage.loanType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(Number(mortgage.currentBalance))}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Monthly Payment</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(Number(mortgage.monthlyPayment))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Interest Rate</p>
                          <p className="font-semibold text-gray-900">
                            {Number(mortgage.interestRate).toFixed(3)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Original Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(Number(mortgage.originalAmount))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Remaining Time</p>
                          <p className="font-semibold text-gray-900">
                            {Math.max(0, remainingMonths)} months
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Started: {formatDate(new Date(mortgage.startDate))}</span>
                          <span>{Math.min(100, progressPercent).toFixed(0)}% paid</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Total Debt Summary */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">Total Mortgage Debt</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        reProperty.mortgages.reduce((sum, m) => sum + Number(m.currentBalance), 0)
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold text-gray-900">Total Monthly Payments</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        reProperty.mortgages.reduce((sum, m) => sum + Number(m.monthlyPayment), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <Link href="/dashboard/properties">
          <Button variant="outline">Back to Properties</Button>
        </Link>
      </div>
    </div>
  )
}
