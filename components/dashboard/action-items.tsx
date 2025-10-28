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
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-orange-500 bg-orange-50'
      case 'low':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Action Items</CardTitle>
          <Bell className="h-5 w-5 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No pending actions</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`border-l-4 p-3 rounded ${getPriorityColor(item.priority)}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-700 mt-1">{item.description}</p>
                    <p className="text-xs text-gray-600 mt-1">Investor: {item.investorName}</p>
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
