import Link from 'next/link'
import { ArrowLeft, Building2, DollarSign, TrendingUp, User, Mail, Calendar } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { PropertyList } from '@/components/dashboard/property-list'
import { RecommendationsList } from '@/components/dashboard/recommendations-list'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { PortfolioCompositionChart } from '@/components/charts/portfolio-composition-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  mockPortfolio,
  mockProperties,
  mockMetrics,
  mockCashFlowData,
  mockRecommendations,
} from '@/lib/mock-data'

// Mock investor data - in production, this would come from your database
const getInvestorData = (id: string) => {
  const investors = {
    '1': {
      id: '1',
      name: 'John Investor',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      joinedDate: new Date('2020-01-15'),
      propertiesCount: 3,
      totalValue: 1315000,
      monthlyIncome: 5600,
      totalROI: 13.1,
      status: 'active' as const,
    },
    '2': {
      id: '2',
      name: 'Sarah Thompson',
      email: 'sarah@example.com',
      phone: '+1 (555) 234-5678',
      joinedDate: new Date('2021-03-20'),
      propertiesCount: 2,
      totalValue: 850000,
      monthlyIncome: 4200,
      totalROI: 11.8,
      status: 'active' as const,
    },
    '3': {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+1 (555) 345-6789',
      joinedDate: new Date('2019-11-10'),
      propertiesCount: 5,
      totalValue: 2100000,
      monthlyIncome: 8900,
      totalROI: 14.5,
      status: 'review-needed' as const,
    },
  }

  return investors[id as keyof typeof investors] || investors['1']
}

export default function InvestorDetailPage({ params }: { params: { id: string } }) {
  const investor = getInvestorData(params.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName="Jane Manager" userRole="manager" />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/dashboard/manager"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Investor Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{investor.name}</h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{investor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Client since {investor.joinedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  investor.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {investor.status === 'active' ? 'Active' : 'Review Needed'}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(mockPortfolio.totalValue)}
            icon={Building2}
            trend={{ value: '8.2%', positive: true }}
          />
          <StatCard
            title="Monthly Cash Flow"
            value={formatCurrency(mockPortfolio.monthlyIncome - mockPortfolio.monthlyExpenses)}
            icon={DollarSign}
            trend={{ value: '5.3%', positive: true }}
          />
          <StatCard
            title="Total ROI"
            value={formatPercentage(mockPortfolio.totalROI)}
            icon={TrendingUp}
            trend={{ value: '2.1%', positive: true }}
          />
          <StatCard
            title="Properties Owned"
            value={mockPortfolio.propertiesCount.toString()}
            icon={Building2}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CashFlowChart data={mockCashFlowData} />
          <PortfolioCompositionChart
            equity={mockPortfolio.totalEquity}
            debt={mockPortfolio.totalDebt}
          />
        </div>

        {/* Properties and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PropertyList properties={mockProperties} metrics={mockMetrics} />
          </div>
          <div>
            <RecommendationsList recommendations={mockRecommendations} />
          </div>
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 pb-4 border-b">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Refinance recommendation sent</p>
                  <p className="text-xs text-gray-600 mt-1">123 Oak Street - 2 days ago</p>
                </div>
              </div>
              <div className="flex gap-3 pb-4 border-b">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Monthly rent collected</p>
                  <p className="text-xs text-gray-600 mt-1">All properties - 5 days ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Portfolio review completed</p>
                  <p className="text-xs text-gray-600 mt-1">Q3 2024 - 1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
