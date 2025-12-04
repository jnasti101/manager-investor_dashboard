import { PropertyTaxService } from '../lib/services/property-tax-service'
import { RealEstateProperty, PropertyExpense, ExpenseCategory } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Mock Property
const mockProperty: any = {
    id: 'prop-1',
    currentValue: new Decimal(500000),
    squareFeet: 2000,
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    yearBuilt: 2010,
    bedrooms: 3,
    bathrooms: new Decimal(2),
    expenses: [
        {
            category: 'PROPERTY_TAX',
            amount: new Decimal(8000), // High tax: 1.6%
            date: new Date(),
        }
    ]
}

async function runTest() {
    console.log('Testing PropertyTaxService...')

    const opportunity = await PropertyTaxService.analyzeProperty(mockProperty, 'Test Property')

    if (opportunity) {
        console.log('✅ Opportunity Found!')
        console.log(`Property: ${opportunity.propertyName}`)
        console.log(`Current Tax: $${opportunity.currentAnnualTax}`)
        console.log(`Fair Market Tax: $${opportunity.averageCompTax.toFixed(2)}`)
        console.log(`Potential Savings: $${opportunity.potentialSavings.toFixed(2)}`)
        console.log(`Comps Found: ${opportunity.comparables.length}`)

        if (opportunity.potentialSavings > 0) {
            console.log('✅ Savings calculation looks correct (positive savings)')
        } else {
            console.error('❌ Savings should be positive')
        }
    } else {
        console.log('ℹ️ No opportunity found (this might be expected if random comps are high)')
    }
}

runTest().catch(console.error)
