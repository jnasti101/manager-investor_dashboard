import { Property, FinancialMetrics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PropertyListProps {
  properties: Property[]
  metrics: Record<string, FinancialMetrics>
}

export function PropertyList({ properties, metrics }: PropertyListProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-slate-700 pb-4">
        <CardTitle className="text-white">Your Properties</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {properties.map((property) => {
            const metric = metrics[property.id]
            const gain = property.currentValue - property.purchasePrice
            const gainPercent = (gain / property.purchasePrice) * 100

            return (
              <Link href={`/dashboard/properties/${property.id}`} key={property.id} className="block group">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">{property.name}</h3>
                        <p className="text-sm text-slate-400">{property.address}</p>
                        <div className="flex gap-4 mt-2 text-xs font-mono">
                          <span className="text-slate-500">
                            Purchase: <span className="text-slate-300">{formatCurrency(property.purchasePrice)}</span>
                          </span>
                          <span className="text-slate-500">
                            Current: <span className="text-white font-medium">{formatCurrency(property.currentValue)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-green-500 font-medium font-mono">
                        <TrendingUp className="h-4 w-4" />
                        {formatCurrency(gain)}
                      </div>
                      <div className="text-green-500 text-xs mt-1">
                        +{gainPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {metric && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-600">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Monthly Rent</p>
                        <p className="font-mono font-medium text-slate-200">{formatCurrency(metric.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Cap Rate</p>
                        <p className="font-mono font-medium text-slate-200">{formatPercentage(metric.capRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">CoC Return</p>
                        <p className="font-mono font-medium text-slate-200">{formatPercentage(metric.cocReturn)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">LTV</p>
                        <p className="font-mono font-medium text-slate-200">{formatPercentage(metric.ltv)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
