import { Users, Building2, DollarSign, TrendingUp } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { InvestorOverviewTable } from '@/components/dashboard/investor-overview-table'
import { ActionItems } from '@/components/dashboard/action-items'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { formatCurrency } from '@/lib/utils'

const mockInvestors = [
  {
    id: '1',
    name: 'John Investor',
    email: 'john@example.com',
    propertiesCount: 3,
    totalValue: 1315000,
    monthlyIncome: 5600,
    totalROI: 13.1,
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Sarah Thompson',
    email: 'sarah@example.com',
    propertiesCount: 2,
    totalValue: 850000,
    monthlyIncome: 4200,
    totalROI: 11.8,
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@example.com',
    propertiesCount: 5,
    totalValue: 2100000,
    monthlyIncome: 8900,
    totalROI: 14.5,
    status: 'review-needed' as const,
  },
]

const mockActionItems = [
  {
    id: '1',
    title: 'Refinance Opportunity',
    description: 'John\'s Oak Street property qualifies for refinancing at 1.5% lower rate',
    priority: 'high' as const,
    investorName: 'John Investor',
  },
  {
    id: '2',
    title: 'Property Valuation Update',
    description: 'Annual valuation needed for Michael\'s commercial properties',
    priority: 'medium' as const,
    investorName: 'Michael Chen',
  },
  {
    id: '3',
    title: 'Lease Renewal',
    description: 'Sarah\'s condo lease expires in 60 days',
    priority: 'medium' as const,
    investorName: 'Sarah Thompson',
  },
]

const mockActivities = [
  {
    id: '1',
    type: 'recommendation_sent' as const,
    description: 'Sent refinance recommendation',
    timestamp: new Date('2024-10-27'),
    investorName: 'John Investor',
  },
  {
    id: '2',
    type: 'property_added' as const,
    description: 'Added new property to portfolio',
    timestamp: new Date('2024-10-26'),
    investorName: 'Michael Chen',
  },
  {
    id: '3',
    type: 'report_generated' as const,
    description: 'Generated Q3 performance report',
    timestamp: new Date('2024-10-25'),
    investorName: 'Sarah Thompson',
  },
]

export default function ManagerDashboard() {
  const totalPortfolioValue = mockInvestors.reduce((sum, inv) => sum + inv.totalValue, 0)
  const totalMonthlyIncome = mockInvestors.reduce((sum, inv) => sum + inv.monthlyIncome, 0)
  const totalProperties = mockInvestors.reduce((sum, inv) => sum + inv.propertiesCount, 0)
  const avgROI = mockInvestors.reduce((sum, inv) => sum + inv.totalROI, 0) / mockInvestors.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName="Jane Manager" userRole="manager" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">
            Manage your investors and their portfolios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Investors"
            value={mockInvestors.length.toString()}
            icon={Users}
          />
          <StatCard
            title="Total Assets Under Management"
            value={formatCurrency(totalPortfolioValue)}
            icon={Building2}
          />
          <StatCard
            title="Total Monthly Income"
            value={formatCurrency(totalMonthlyIncome)}
            icon={DollarSign}
          />
          <StatCard
            title="Average ROI"
            value={`${avgROI.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <InvestorOverviewTable investors={mockInvestors} />
          </div>
          <div className="space-y-6">
            <ActionItems items={mockActionItems} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={mockActivities} />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Add New Property
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Create Recommendation
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Generate Report
              </button>
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-gray-900 font-medium">
                Invite New Investor
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
