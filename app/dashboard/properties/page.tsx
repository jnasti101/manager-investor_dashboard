import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ExportButton } from '@/components/properties/export-button'

export default async function PropertiesPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const properties = await prisma.asset.findMany({
    where: {
      userId: session.user.id,
      assetType: 'real_estate',
    },
    include: {
      realEstateProperty: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          mortgages: true,
          expenses: true,
        },
      },
      incomeStreams: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate portfolio metrics
  const totalValue = properties.reduce((sum, p) => sum + Number(p.currentValue), 0)
  const totalCostBasis = properties.reduce((sum, p) => sum + Number(p.costBasis), 0)
  const totalDebt = properties.reduce((sum, p) => {
    const mortgageDebt = p.realEstateProperty?.mortgages.reduce(
      (mSum, m) => mSum + Number(m.currentBalance),
      0
    ) || 0
    return sum + mortgageDebt
  }, 0)
  const totalEquity = totalValue - totalDebt
  const totalAppreciation = totalValue - totalCostBasis
  const appreciationPercent = totalCostBasis > 0 ? (totalAppreciation / totalCostBasis) * 100 : 0

  // Calculate monthly cash flow
  const monthlyIncome = properties.reduce((sum, p) => {
    const propertyIncome = p.incomeStreams.reduce((iSum, income) => {
      const today = new Date()
      const incomeStart = new Date(income.startDate)
      const incomeEnd = income.endDate ? new Date(income.endDate) : null
      const isActive = incomeStart <= today && (!incomeEnd || incomeEnd >= today)

      if (isActive && income.isRecurring) {
        const monthlyAmount = income.frequency === 'MONTHLY' ? Number(income.amount) :
                            income.frequency === 'QUARTERLY' ? Number(income.amount) / 3 :
                            income.frequency === 'ANNUALLY' ? Number(income.amount) / 12 : 0
        return iSum + monthlyAmount
      }
      return iSum
    }, 0)
    return sum + propertyIncome
  }, 0)

  const monthlyExpenses = properties.reduce((sum, p) => {
    const propertyExpenses = p.realEstateProperty?.expenses.reduce((eSum, expense) => {
      const today = new Date()
      const expenseDate = new Date(expense.date)
      if (expense.recurring && expenseDate <= today) {
        return eSum + Number(expense.amount)
      }
      return eSum
    }, 0) || 0
    return sum + propertyExpenses
  }, 0)

  const monthlyMortgagePayments = properties.reduce((sum, p) => {
    const propertyPayments = p.realEstateProperty?.mortgages.reduce(
      (mSum, m) => mSum + Number(m.monthlyPayment),
      0
    ) || 0
    return sum + propertyPayments
  }, 0)

  const netMonthlyCashFlow = monthlyIncome - monthlyExpenses - monthlyMortgagePayments

  // Calculate per-property metrics for sorting/display
  const propertiesWithMetrics = properties.map((property) => {
    const mortgageDebt = property.realEstateProperty?.mortgages.reduce(
      (sum, m) => sum + Number(m.currentBalance),
      0
    ) || 0
    const equity = Number(property.currentValue) - mortgageDebt
    const appreciation = Number(property.currentValue) - Number(property.costBasis)
    const appreciationPct = Number(property.costBasis) > 0
      ? (appreciation / Number(property.costBasis)) * 100
      : 0

    return {
      ...property,
      calculatedMetrics: {
        equity,
        debt: mortgageDebt,
        appreciation,
        appreciationPct,
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your real estate portfolio</p>
          </div>
          <div className="flex gap-3">
            {properties.length > 0 && <ExportButton />}
            <Link href="/dashboard/properties/new">
              <Button>Add Property</Button>
            </Link>
          </div>
        </div>

        {properties.length > 0 && (
          <>
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
                  <div className="flex items-center mt-1 text-sm">
                    {appreciationPercent > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : appreciationPercent < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-400 mr-1" />
                    )}
                    <span className={appreciationPercent > 0 ? 'text-green-600' : appreciationPercent < 0 ? 'text-red-600' : 'text-gray-600'}>
                      {formatPercentage(appreciationPercent)} appreciation
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Equity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalEquity)}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {totalValue > 0 ? formatPercentage((totalEquity / totalValue) * 100) : '0%'} of value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Debt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebt)}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(monthlyMortgagePayments)}/mo payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Net Monthly Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netMonthlyCashFlow)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(monthlyIncome)} in - {formatCurrency(monthlyExpenses + monthlyMortgagePayments)} out
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first property</p>
              <Link href="/dashboard/properties/new">
                <Button>Add Your First Property</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesWithMetrics.map((property) => {
              const reProperty = property.realEstateProperty
              const image = reProperty?.images[0]
              const metrics = property.calculatedMetrics

              return (
                <Link
                  key={property.id}
                  href={`/dashboard/properties/${property.id}`}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    {image ? (
                      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-indigo-400" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {property.name}
                        </h3>
                        {metrics.appreciationPct !== 0 && (
                          <div className="flex items-center">
                            {metrics.appreciationPct > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ml-1 ${metrics.appreciationPct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(metrics.appreciationPct)}
                            </span>
                          </div>
                        )}
                      </div>
                      {reProperty && (
                        <>
                          <p className="text-sm text-gray-600 mb-3">
                            {reProperty.address}, {reProperty.city}, {reProperty.state}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs text-gray-600">Current Value</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(Number(property.currentValue))}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Equity</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(metrics.equity)}
                                </p>
                              </div>
                            </div>
                            {metrics.debt > 0 && (
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">Debt</span>
                                  <span className="font-medium text-gray-900">
                                    {formatCurrency(metrics.debt)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard/investor">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
