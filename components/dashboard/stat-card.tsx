import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-semibold mt-2 text-foreground">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value} <span className="text-muted-foreground ml-1">vs last month</span>
              </p>
            )}
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
