export type UserRole = 'investor' | 'manager' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface Property {
  id: string
  name: string
  address: string
  purchasePrice: number
  currentValue: number
  purchaseDate: Date
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'condo'
  investorId: string
}

export interface FinancialMetrics {
  propertyId: string
  monthlyRent: number
  monthlyExpenses: number
  noi: number // Net Operating Income
  capRate: number
  cocReturn: number // Cash on Cash Return
  irr: number // Internal Rate of Return
  ltv: number // Loan to Value
}

export interface Loan {
  id: string
  propertyId: string
  balance: number
  interestRate: number
  monthlyPayment: number
  maturityDate: Date
  lender: string
}

export interface Expense {
  id: string
  propertyId: string
  amount: number
  category: 'maintenance' | 'tax' | 'insurance' | 'utilities' | 'management' | 'other'
  date: Date
  description: string
  taxDeductible: boolean
}

export interface Recommendation {
  id: string
  userId: string
  type: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'DISMISSED' | 'IN_PROGRESS' | 'IMPLEMENTED'
  source: 'AI' | 'ADVISOR' | 'SYSTEM'
  createdById: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Portfolio {
  investorId: string
  totalValue: number
  totalEquity: number
  totalDebt: number
  monthlyIncome: number
  monthlyExpenses: number
  propertiesCount: number
  averageLTV: number
  totalROI: number
}

export interface CashFlowData {
  month: string
  income: number
  expenses: number
  netCashFlow: number
}
