import { Property, FinancialMetrics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Building2, TrendingUp } from 'lucide-react'

interface PropertyListProps {
  properties: Property[]
  metrics: Record<string, FinancialMetrics>
}

export function PropertyList({ properties, metrics }: PropertyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => {
            const metric = metrics[property.id]
            const gain = property.currentValue - property.purchasePrice
            const gainPercent = (gain / property.purchasePrice) * 100

            return (
              <div
                key={property.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-600">{property.address}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-700">
                          Purchase: {formatCurrency(property.purchasePrice)}
                        </span>
                        <span className="text-gray-700">
                          Current: {formatCurrency(property.currentValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                      <TrendingUp className="h-4 w-4" />
                      {formatCurrency(gain)}
                    </div>
                    <p className="text-sm text-gray-600">
                      +{gainPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {metric && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Monthly Rent</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(metric.monthlyRent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Cap Rate</p>
                      <p className="font-semibold text-gray-900">{formatPercentage(metric.capRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">CoC Return</p>
                      <p className="font-semibold text-gray-900">{formatPercentage(metric.cocReturn)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">LTV</p>
                      <p className="font-semibold text-gray-900">{formatPercentage(metric.ltv)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
