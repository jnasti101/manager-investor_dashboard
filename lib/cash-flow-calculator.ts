import { CashFlowData } from '@/types'

interface IncomeStream {
  amount: number
  frequency: string
  startDate: Date
  endDate: Date | null
  isRecurring: boolean
}

interface Expense {
  amount: number
  date: Date
  recurring: boolean
}

/**
 * Calculate monthly equivalent amount based on frequency
 */
export function calculateMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'MONTHLY':
      return amount
    case 'QUARTERLY':
      return amount / 3
    case 'ANNUALLY':
      return amount / 12
    case 'ONE_TIME':
      return 0
    default:
      return 0
  }
}

/**
 * Generate cash flow data for the last N months
 */
export function generateCashFlowData(
  incomeStreams: IncomeStream[],
  expenses: Expense[],
  monthsBack: number = 6
): CashFlowData[] {
  const cashFlowData: CashFlowData[] = []
  const today = new Date()

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

    // Calculate income for this month
    let monthlyIncome = 0
    incomeStreams.forEach((income) => {
      const incomeStart = new Date(income.startDate)
      const incomeEnd = income.endDate ? new Date(income.endDate) : null

      // Check if income stream was active during this month
      const isActive =
        incomeStart <= monthEnd &&
        (!incomeEnd || incomeEnd >= monthStart)

      if (isActive && income.isRecurring) {
        monthlyIncome += calculateMonthlyAmount(Number(income.amount), income.frequency)
      }
    })

    // Calculate expenses for this month
    let monthlyExpenses = 0
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)

      if (expense.recurring) {
        // Recurring expenses: count if they started before or during this month
        if (expenseDate <= monthEnd) {
          monthlyExpenses += Number(expense.amount)
        }
      } else {
        // One-time expenses: count only if they occurred during this month
        if (expenseDate >= monthStart && expenseDate <= monthEnd) {
          monthlyExpenses += Number(expense.amount)
        }
      }
    })

    cashFlowData.push({
      month: monthName,
      income: Math.round(monthlyIncome * 100) / 100,
      expenses: Math.round(monthlyExpenses * 100) / 100,
      netCashFlow: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
    })
  }

  return cashFlowData
}

/**
 * Calculate current monthly cash flow
 */
export function calculateCurrentMonthlyCashFlow(
  incomeStreams: IncomeStream[],
  expenses: Expense[]
): { income: number; expenses: number; netCashFlow: number } {
  const today = new Date()

  // Calculate current monthly income (only recurring)
  const monthlyIncome = incomeStreams.reduce((sum, income) => {
    const incomeStart = new Date(income.startDate)
    const incomeEnd = income.endDate ? new Date(income.endDate) : null

    // Check if income stream is currently active
    const isActive = incomeStart <= today && (!incomeEnd || incomeEnd >= today)

    if (isActive && income.isRecurring) {
      return sum + calculateMonthlyAmount(Number(income.amount), income.frequency)
    }
    return sum
  }, 0)

  // Calculate current monthly expenses (only recurring)
  const monthlyExpenses = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date)

    // Recurring expenses that have started
    if (expense.recurring && expenseDate <= today) {
      return sum + Number(expense.amount)
    }
    return sum
  }, 0)

  return {
    income: Math.round(monthlyIncome * 100) / 100,
    expenses: Math.round(monthlyExpenses * 100) / 100,
    netCashFlow: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
  }
}
