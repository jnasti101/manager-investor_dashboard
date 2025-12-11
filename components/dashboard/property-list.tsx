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
    <Card className="glass-panel border-none">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-white font-display">Your Properties</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {properties.map((property) => {
            const metric = metrics[property.id]
            const gain = property.currentValue - property.purchasePrice
            const gainPercent = (gain / property.purchasePrice) * 100

            return (
              <Link href={`/dashboard/properties/${property.id}`} key={property.id} className="block group">
                <div
                  className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-emerald-900/40 to-emerald-500/20 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="h-7 w-7 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors">{property.name}</h3>
                        <p className="text-sm text-slate-400">{property.address}</p>
                        <div className="flex gap-4 mt-2 text-xs font-mono">
                          <span className="text-slate-500">
                            Purchase: <span className="text-slate-300">{formatCurrency(property.purchasePrice)}</span>
                          </span>
                          <span className="text-slate-500">
                            Current: <span className="text-emerald-400 font-bold">{formatCurrency(property.currentValue)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold font-mono">
                        <TrendingUp className="h-4 w-4" />
                        {formatCurrency(gain)}
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded inline-block mt-1">
                        +{gainPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {metric && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Monthly Rent</p>
                        <p className="font-mono font-medium text-slate-200">{formatCurrency(metric.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Cap Rate</p>
                        <p className="font-mono font-medium text-slate-200">{formatPercentage(metric.capRate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">CoC Return</p>
                        <p className="font-mono font-medium text-emerald-400">{formatPercentage(metric.cocReturn)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">LTV</p>
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
