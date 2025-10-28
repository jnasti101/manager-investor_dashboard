import { Property, Portfolio, CashFlowData, Recommendation, FinancialMetrics } from '@/types'

export const mockProperties: Property[] = [
  {
    id: '1',
    name: '123 Oak Street',
    address: '123 Oak Street, Austin, TX 78701',
    purchasePrice: 350000,
    currentValue: 425000,
    purchaseDate: new Date('2020-06-15'),
    propertyType: 'single-family',
    investorId: 'investor1',
  },
  {
    id: '2',
    name: '456 Maple Avenue',
    address: '456 Maple Avenue, Austin, TX 78702',
    purchasePrice: 280000,
    currentValue: 310000,
    purchaseDate: new Date('2021-03-20'),
    propertyType: 'condo',
    investorId: 'investor1',
  },
  {
    id: '3',
    name: '789 Pine Boulevard',
    address: '789 Pine Boulevard, Austin, TX 78703',
    purchasePrice: 520000,
    currentValue: 580000,
    purchaseDate: new Date('2019-11-10'),
    propertyType: 'multi-family',
    investorId: 'investor1',
  },
]

export const mockMetrics: Record<string, FinancialMetrics> = {
  '1': {
    propertyId: '1',
    monthlyRent: 2800,
    monthlyExpenses: 1200,
    noi: 19200,
    capRate: 5.49,
    cocReturn: 12.3,
    irr: 14.2,
    ltv: 65,
  },
  '2': {
    propertyId: '2',
    monthlyRent: 2200,
    monthlyExpenses: 900,
    noi: 15600,
    capRate: 5.57,
    cocReturn: 11.8,
    irr: 13.5,
    ltv: 70,
  },
  '3': {
    propertyId: '3',
    monthlyRent: 4500,
    monthlyExpenses: 1800,
    noi: 32400,
    capRate: 6.23,
    cocReturn: 15.2,
    irr: 16.8,
    ltv: 60,
  },
}

export const mockPortfolio: Portfolio = {
  investorId: 'investor1',
  totalValue: 1315000,
  totalEquity: 462250,
  totalDebt: 852750,
  monthlyIncome: 9500,
  monthlyExpenses: 3900,
  propertiesCount: 3,
  averageLTV: 64.8,
  totalROI: 13.1,
}

export const mockCashFlowData: CashFlowData[] = [
  { month: 'Jan', income: 9200, expenses: 3800, netCashFlow: 5400 },
  { month: 'Feb', income: 9200, expenses: 4200, netCashFlow: 5000 },
  { month: 'Mar', income: 9500, expenses: 3600, netCashFlow: 5900 },
  { month: 'Apr', income: 9500, expenses: 3900, netCashFlow: 5600 },
  { month: 'May', income: 9500, expenses: 4100, netCashFlow: 5400 },
  { month: 'Jun', income: 9800, expenses: 3800, netCashFlow: 6000 },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    propertyId: '1',
    type: 'refinance',
    title: 'Refinance Opportunity - 123 Oak Street',
    description: 'Current rates are 1.5% lower than your existing mortgage. Refinancing could save you $280/month.',
    priority: 'high',
    createdBy: 'manager1',
    createdAt: new Date('2024-10-15'),
    status: 'pending',
  },
  {
    id: '2',
    propertyId: '3',
    type: 'repair',
    title: 'HVAC Maintenance - 789 Pine Boulevard',
    description: 'Annual HVAC inspection is due. Preventive maintenance can avoid costly repairs.',
    priority: 'medium',
    createdBy: 'manager1',
    createdAt: new Date('2024-10-20'),
    status: 'pending',
  },
]
