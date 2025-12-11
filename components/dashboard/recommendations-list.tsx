import { Recommendation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10'
      case 'HIGH':
        return 'text-red-400 bg-red-500/10'
      case 'MEDIUM':
        return 'text-orange-400 bg-orange-500/10'
      case 'LOW':
        return 'text-blue-400 bg-blue-500/10'
      default:
        return 'text-muted-foreground bg-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-orange-400" />
      case 'IN_PROGRESS':
        return <AlertCircle className="h-5 w-5 text-blue-400" />
      case 'IMPLEMENTED':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />
      case 'DISMISSED':
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Manager Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recommendations yet</p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-border bg-card/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(rec.status)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground">{rec.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
