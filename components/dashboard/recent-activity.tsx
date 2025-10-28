import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'property_added' | 'recommendation_sent' | 'report_generated' | 'message_sent'
  description: string
  timestamp: Date
  investorName: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    return <Activity className="h-4 w-4 text-indigo-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <span>{activity.investorName}</span>
                  <span>•</span>
                  <span>{activity.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
