import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Users, ChevronRight } from 'lucide-react'

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Investors Overview</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{investors.length} Total Investors</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Investor</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Properties</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Portfolio Value</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Monthly Income</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">ROI</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.id} className="border-b hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/manager/investor/${investor.id}`} className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600">{investor.name}</p>
                        <p className="text-sm text-gray-600">{investor.email}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900 font-medium">{investor.propertiesCount}</td>
                  <td className="text-right py-3 px-4 text-gray-900 font-medium">
                    {formatCurrency(investor.totalValue)}
                  </td>
                  <td className="text-right py-3 px-4 text-green-600 font-medium">
                    {formatCurrency(investor.monthlyIncome)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900 font-medium">
                    {formatPercentage(investor.totalROI)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        investor.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {investor.status === 'active' ? 'Active' : 'Review Needed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
