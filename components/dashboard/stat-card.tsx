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
    <Card className="glass-card border-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">{title}</p>
            <p className="text-2xl font-display font-bold mt-2 text-white">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value} <span className="text-slate-500 ml-1">vs last month</span>
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center shadow-inner">
            <Icon className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
