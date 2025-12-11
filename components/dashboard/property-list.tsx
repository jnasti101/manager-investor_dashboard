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
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-foreground">Your Properties</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {properties.map((property) => {
            const metric = metrics[property.id]
            const gain = property.currentValue - property.purchasePrice
            const gainPercent = (gain / property.purchasePrice) * 100

            return (
              <Link href={`/dashboard/properties/${property.id}`} key={property.id} className="block group">
                <div className="bg-card/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <div className="flex gap-4 mt-2 text-xs font-mono">
                          <span className="text-muted-foreground">
                            Purchase: <span className="text-foreground">{formatCurrency(property.purchasePrice)}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Current: <span className="text-foreground font-medium">{formatCurrency(property.currentValue)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-emerald-500 font-medium font-mono">
                        <TrendingUp className="h-4 w-4" />
                        {formatCurrency(gain)}
                      </div>
                      <div className="text-emerald-500 text-xs mt-1">
                        +{gainPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {metric && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Rent</p>
                        <p className="font-mono font-medium text-foreground">{formatCurrency(metric.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Cap Rate</p>
                        <p className="font-mono font-medium text-foreground">{formatPercentage(metric.capRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">CoC Return</p>
                        <p className="font-mono font-medium text-foreground">{formatPercentage(metric.cocReturn)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">LTV</p>
                        <p className="font-mono font-medium text-foreground">{formatPercentage(metric.ltv)}</p>
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
