'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface PropertyFormProps {
  property?: any // For editing existing property
  onSuccess?: () => void
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.realEstateProperty?.address || '',
    city: property?.realEstateProperty?.city || '',
    state: property?.realEstateProperty?.state || '',
    zipCode: property?.realEstateProperty?.zipCode || '',
    propertyType: property?.realEstateProperty?.propertyType || 'SINGLE_FAMILY',
    bedrooms: property?.realEstateProperty?.bedrooms || '',
    bathrooms: property?.realEstateProperty?.bathrooms || '',
    squareFeet: property?.realEstateProperty?.squareFeet || '',
    yearBuilt: property?.realEstateProperty?.yearBuilt || '',
    purchasePrice: property?.realEstateProperty?.purchasePrice || '',
    purchaseDate: property?.realEstateProperty?.purchaseDate?.split('T')[0] || '',
    currentValue: property?.currentValue || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = property
        ? `/api/properties/${property.id}`
        : '/api/properties'
      const method = property ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms as string) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms as string) : null,
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet as string) : null,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt as string) : null,
          purchasePrice: parseFloat(formData.purchasePrice as string),
          currentValue: parseFloat(formData.currentValue as string),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save property')
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/properties')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
            Property Name
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="e.g., Downtown Apartment"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
            Street Address
          </label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
            placeholder="123 Main St"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">
            City
          </label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-900 mb-2">
            State
          </label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
            required
            maxLength={2}
            placeholder="CA"
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-900 mb-2">
            ZIP Code
          </label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-900 mb-2">
            Property Type
          </label>
          <select
            id="propertyType"
            value={formData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            required
          >
            <option value="SINGLE_FAMILY">Single Family</option>
            <option value="MULTI_FAMILY">Multi-Family</option>
            <option value="CONDO">Condo</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="LAND">Land</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-900 mb-2">
            Bedrooms
          </label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-900 mb-2">
            Bathrooms
          </label>
          <Input
            id="bathrooms"
            type="number"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="squareFeet" className="block text-sm font-medium text-gray-900 mb-2">
            Square Feet
          </label>
          <Input
            id="squareFeet"
            type="number"
            value={formData.squareFeet}
            onChange={(e) => handleChange('squareFeet', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-900 mb-2">
            Year Built
          </label>
          <Input
            id="yearBuilt"
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => handleChange('yearBuilt', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-900 mb-2">
            Purchase Price
          </label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => handleChange('purchasePrice', e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-900 mb-2">
            Purchase Date
          </label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="currentValue" className="block text-sm font-medium text-gray-900 mb-2">
            Current Value
          </label>
          <Input
            id="currentValue"
            type="number"
            step="0.01"
            value={formData.currentValue}
            onChange={(e) => handleChange('currentValue', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
        </Button>
      </div>
    </form>
  )
}
