'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Users, ChevronRight, MessageSquare } from 'lucide-react'
import { CreateRecommendationModal } from './create-recommendation-modal'

interface InvestorData {
  id: string
  name: string
  email: string
  propertiesCount: number
  totalValue: number
  monthlyIncome: number
  totalROI: number
  status: 'active' | 'review-needed'
}

interface InvestorOverviewTableProps {
  investors: InvestorData[]
}

export function InvestorOverviewTable({ investors }: InvestorOverviewTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorData | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateRecommendation = (investor: InvestorData) => {
    setSelectedInvestor(investor)
    setModalOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
    // Show success message or refresh data
  }
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Investors Overview</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{investors.length} Total Investors</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Investor</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">Properties</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">Portfolio Value</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">Monthly Income</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">ROI</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-foreground">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/manager/investor/${investor.id}`} className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{investor.name}</p>
                        <p className="text-sm text-muted-foreground">{investor.email}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </td>
                  <td className="text-right py-3 px-4 text-foreground font-medium">{investor.propertiesCount}</td>
                  <td className="text-right py-3 px-4 text-foreground font-medium">
                    {formatCurrency(investor.totalValue)}
                  </td>
                  <td className="text-right py-3 px-4 text-emerald-500 font-medium">
                    {formatCurrency(investor.monthlyIncome)}
                  </td>
                  <td className="text-right py-3 px-4 text-foreground font-medium">
                    {formatPercentage(investor.totalROI)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${investor.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-orange-500/10 text-orange-500'
                        }`}
                    >
                      {investor.status === 'active' ? 'Active' : 'Review Needed'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateRecommendation(investor)}
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Suggest
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {selectedInvestor && (
        <CreateRecommendationModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          investorId={selectedInvestor.id}
          investorName={selectedInvestor.name}
          onSuccess={handleSuccess}
        />
      )}
    </Card>
  )
}
