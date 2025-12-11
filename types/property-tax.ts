export interface ComparableProperty {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  squareFeet: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  lastSalePrice: number
  lastSaleDate: string
  assessedValue: number
  annualPropertyTax: number
  distanceMiles: number
}

export interface TaxAssessment {
  year: number
  assessedValue: number
  taxAmount: number
  taxRate: number
}

export interface TaxSavingsOpportunity {
  propertyId: string
  propertyName: string
  currentAnnualTax: number
  averageCompTax: number
  potentialSavings: number
  confidenceScore: number // 0-100
  comparables: ComparableProperty[]
  recommendedAction: string
}
