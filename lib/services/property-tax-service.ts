import { ComparableProperty, TaxSavingsOpportunity } from '@/types/property-tax'
import { RealEstateProperty, PropertyExpense, ExpenseCategory } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Mock function to simulate fetching comps from an external API
async function fetchComps(property: RealEstateProperty): Promise<ComparableProperty[]> {
    // In a real app, this would call an API like Zillow, Attom, or CoreLogic
    // For now, we generate realistic mock data based on the subject property

    const baseValue = Number(property.currentValue)
    const baseTax = baseValue * 0.012 // Assume ~1.2% tax rate roughly

    // Generate 3-5 comps
    const numComps = 3 + Math.floor(Math.random() * 3)
    const comps: ComparableProperty[] = []

    for (let i = 0; i < numComps; i++) {
        // Variance factors
        const valueVariance = 0.85 + Math.random() * 0.3 // 0.85 - 1.15
        const taxVariance = 0.8 + Math.random() * 0.3 // 0.8 - 1.1 (Comps often have lower assessments)

        comps.push({
            id: `comp-${i}`,
            address: `${Math.floor(100 + Math.random() * 900)} Neighbor St`,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            squareFeet: (property.squareFeet || 2000) * (0.9 + Math.random() * 0.2),
            yearBuilt: (property.yearBuilt || 1990) + Math.floor(Math.random() * 10 - 5),
            bedrooms: property.bedrooms || 3,
            bathrooms: Number(property.bathrooms) || 2,
            lastSalePrice: baseValue * valueVariance,
            lastSaleDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Last year
            assessedValue: baseValue * valueVariance * 0.8, // Assessed value often lower than market
            annualPropertyTax: baseTax * taxVariance,
            distanceMiles: 0.1 + Math.random() * 0.5
        })
    }

    return comps
}

export const PropertyTaxService = {
    async analyzeProperty(
        property: RealEstateProperty & { expenses: PropertyExpense[] },
        propertyName: string
    ): Promise<TaxSavingsOpportunity | null> {

        // 1. Find current tax expense
        // In a real app, we'd look for the most recent year's total tax
        // Here we'll look for the most recent 'PROPERTY_TAX' expense or estimate it
        const taxExpenses = property.expenses.filter(e => e.category === 'PROPERTY_TAX')

        let currentAnnualTax = 0

        if (taxExpenses.length > 0) {
            // Sort by date desc
            taxExpenses.sort((a, b) => b.date.getTime() - a.date.getTime())
            // Take the most recent one and assume it's annual or annualized
            // Simplified logic: if > $1000 assume annual, else multiply by 12? 
            // Let's assume the expense stored is the annual amount for simplicity in this MVP
            currentAnnualTax = Number(taxExpenses[0].amount)
        } else {
            // Fallback estimate: 1.2% of current value
            currentAnnualTax = Number(property.currentValue) * 0.012
        }

        // 2. Fetch Comps
        const comps = await fetchComps(property)

        // 3. Calculate Average Comp Tax (adjusted for sqft)
        const subjectSqFt = property.squareFeet || 2000

        let totalCompTaxPerSqFt = 0
        comps.forEach(comp => {
            totalCompTaxPerSqFt += comp.annualPropertyTax / comp.squareFeet
        })

        const avgCompTaxPerSqFt = totalCompTaxPerSqFt / comps.length
        const expectedTax = avgCompTaxPerSqFt * subjectSqFt

        // 4. Determine Savings
        // If current tax is significantly higher than expected (e.g. > 10% higher)
        const threshold = 1.10

        if (currentAnnualTax > expectedTax * threshold) {
            const potentialSavings = currentAnnualTax - expectedTax

            return {
                propertyId: property.id,
                propertyName: propertyName,
                currentAnnualTax,
                averageCompTax: expectedTax,
                potentialSavings,
                confidenceScore: 85, // Mock confidence
                comparables: comps,
                recommendedAction: 'File a property tax appeal based on comparable sales.'
            }
        }

        return null
    },

    async createAppeal(
        propertyId: string,
        currentAssessedValue: number,
        targetAssessedValue: number,
        taxYear: number
    ) {
        // Create a new appeal in draft status
        const appeal = await prisma.taxAppeal.create({
            data: {
                propertyId,
                currentAssessedValue,
                targetAssessedValue,
                taxYear,
                status: 'DRAFT'
            }
        })
        return appeal
    },

    async getActiveAppeal(propertyId: string) {
        // Find the most recent active appeal
        const appeal = await prisma.taxAppeal.findFirst({
            where: { propertyId },
            orderBy: { createdAt: 'desc' }
        })
        return appeal
    }
}
