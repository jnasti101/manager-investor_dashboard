'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface MortgageFormProps {
  propertyId: string
  onSuccess?: () => void
}

export function MortgageForm({ propertyId, onSuccess }: MortgageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    lender: '',
    loanType: 'fixed',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    termMonths: '360',
    startDate: new Date().toISOString().split('T')[0],
    monthlyPayment: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/properties/${propertyId}/mortgages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          originalAmount: parseFloat(formData.originalAmount),
          currentBalance: parseFloat(formData.currentBalance),
          interestRate: parseFloat(formData.interestRate),
          termMonths: parseInt(formData.termMonths),
          monthlyPayment: parseFloat(formData.monthlyPayment),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to add mortgage')
        return
      }

      // Reset form
      setFormData({
        lender: '',
        loanType: 'fixed',
        originalAmount: '',
        currentBalance: '',
        interestRate: '',
        termMonths: '360',
        startDate: new Date().toISOString().split('T')[0],
        monthlyPayment: '',
      })
      setIsOpen(false)

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        Add Mortgage
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-white">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lender" className="block text-sm font-medium text-gray-900 mb-1">
            Lender
          </label>
          <Input
            id="lender"
            value={formData.lender}
            onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
            placeholder="e.g., Wells Fargo"
            required
          />
        </div>

        <div>
          <label htmlFor="loanType" className="block text-sm font-medium text-gray-900 mb-1">
            Loan Type
          </label>
          <select
            id="loanType"
            value={formData.loanType}
            onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <option value="fixed">Fixed Rate</option>
            <option value="arm">Adjustable Rate (ARM)</option>
            <option value="conventional">Conventional</option>
            <option value="fha">FHA</option>
            <option value="va">VA</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="originalAmount" className="block text-sm font-medium text-gray-900 mb-1">
            Original Loan Amount
          </label>
          <Input
            id="originalAmount"
            type="number"
            step="0.01"
            value={formData.originalAmount}
            onChange={(e) => setFormData({ ...formData, originalAmount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-900 mb-1">
            Current Balance
          </label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            value={formData.currentBalance}
            onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-900 mb-1">
            Interest Rate (%)
          </label>
          <Input
            id="interestRate"
            type="number"
            step="0.001"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="e.g., 4.5"
            required
          />
        </div>

        <div>
          <label htmlFor="termMonths" className="block text-sm font-medium text-gray-900 mb-1">
            Loan Term (months)
          </label>
          <select
            id="termMonths"
            value={formData.termMonths}
            onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <option value="180">15 years (180 months)</option>
            <option value="240">20 years (240 months)</option>
            <option value="360">30 years (360 months)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-1">
            Start Date
          </label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-900 mb-1">
            Monthly Payment
          </label>
          <Input
            id="monthlyPayment"
            type="number"
            step="0.01"
            value={formData.monthlyPayment}
            onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
          size="sm"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? 'Adding...' : 'Add Mortgage'}
        </Button>
      </div>
    </form>
  )
}
