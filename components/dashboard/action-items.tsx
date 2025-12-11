import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Bell } from 'lucide-react'

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  investorName: string
}

interface ActionItemsProps {
  items: ActionItem[]
}

export function ActionItems({ items }: ActionItemsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-500/10'
      case 'medium':
        return 'border-orange-500 bg-orange-500/10'
      case 'low':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-muted bg-secondary'
    }
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Action Items</CardTitle>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending actions</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`border-l-4 p-3 rounded ${getPriorityColor(item.priority)}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-foreground" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Investor: {item.investorName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
