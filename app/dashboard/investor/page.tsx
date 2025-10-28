import { Building2, DollarSign, TrendingUp, Home } from 'lucide-react'
import { Navbar } from '@/components/dashboard/navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { PropertyList } from '@/components/dashboard/property-list'
import { RecommendationsList } from '@/components/dashboard/recommendations-list'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { PortfolioCompositionChart } from '@/components/charts/portfolio-composition-chart'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  mockPortfolio,
  mockProperties,
  mockMetrics,
  mockCashFlowData,
  mockRecommendations,
} from '@/lib/mock-data'

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName="John Investor" userRole="investor" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Portfolio Overview</h1>
          <p className="text-gray-600">
            Track your real estate investments and performance
          </p>
        </div>

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
            title="Properties"
            value={mockPortfolio.propertiesCount.toString()}
            icon={Home}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CashFlowChart data={mockCashFlowData} />
          <PortfolioCompositionChart
            equity={mockPortfolio.totalEquity}
            debt={mockPortfolio.totalDebt}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyList properties={mockProperties} metrics={mockMetrics} />
          </div>
          <div>
            <RecommendationsList recommendations={mockRecommendations} />
          </div>
        </div>
      </main>
    </div>
  )
}
