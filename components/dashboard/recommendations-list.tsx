import { Recommendation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-orange-600 bg-orange-50'
      case 'low':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'reviewed':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recommendations yet</p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(rec.status)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>Type: {rec.type}</span>
                      <span>Status: {rec.status}</span>
                      <span>{rec.createdAt.toLocaleDateString()}</span>
                    </div>
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
