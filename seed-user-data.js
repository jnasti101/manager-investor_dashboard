const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const userId = '817f160e-cd04-40c5-8a5d-6c17e14bc89b'

async function seedUserData() {
  try {
    console.log('Creating mock properties and data...')

    // Property 1: Single Family Home in Austin
    const property1 = await prisma.asset.create({
      data: {
        userId: userId,
        assetType: 'real_estate',
        name: '123 Oak Street',
        currentValue: 450000,
        costBasis: 380000,
        realEstateProperty: {
          create: {
            address: '123 Oak Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            propertyType: 'SINGLE_FAMILY',
            purchasePrice: 380000,
            purchaseDate: new Date('2020-03-15'),
            currentValue: 450000,
            squareFeet: 2200,
            bedrooms: 3,
            bathrooms: 2.5,
          }
        }
      },
      include: {
        realEstateProperty: true
      }
    })

    // Add mortgage for Property 1
    await prisma.propertyMortgage.create({
      data: {
        propertyId: property1.realEstateProperty.id,
        lender: 'Wells Fargo Bank',
        loanType: 'conventional',
        originalAmount: 304000, // 80% LTV
        currentBalance: 285000,
        interestRate: 3.25,
        monthlyPayment: 1850,
        startDate: new Date('2020-03-15'),
        termMonths:360, // 30 years
      }
    })

    // Add rental income for Property 1
    await prisma.incomeStream.create({
      data: {
        assetId: property1.id,
        userId: userId,
        name: 'Rental Income',
        incomeType: 'rental',
        amount: 2800,
        frequency: 'MONTHLY',
        startDate: new Date('2020-04-01'),
        isRecurring: true,
      }
    })

    // Add expenses for Property 1
    await prisma.propertyExpense.create({
      data: {
        propertyId: property1.realEstateProperty.id,
        description: 'Property Tax',
        category: 'PROPERTY_TAX',
        amount: 625, // ~$7,500/year
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property1.realEstateProperty.id,
        description: 'Home Insurance',
        category: 'INSURANCE',
        amount: 125,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property1.realEstateProperty.id,
        description: 'HOA Fees',
        category: 'OTHER',
        amount: 150,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    console.log('✅ Property 1 created: 123 Oak Street, Austin')

    // Property 2: Multi-Family in Dallas
    const property2 = await prisma.asset.create({
      data: {
        userId: userId,
        assetType: 'real_estate',
        name: '456 Elm Avenue Duplex',
        currentValue: 525000,
        costBasis: 475000,
        realEstateProperty: {
          create: {
            address: '456 Elm Avenue',
            city: 'Dallas',
            state: 'TX',
            zipCode: '75201',
            propertyType: 'MULTI_FAMILY',
            purchasePrice: 475000,
            purchaseDate: new Date('2021-06-20'),
            currentValue: 525000,
            squareFeet: 3200,
            bedrooms: 6,
            bathrooms: 4,
          }
        }
      },
      include: {
        realEstateProperty: true
      }
    })

    // Add mortgage for Property 2
    await prisma.propertyMortgage.create({
      data: {
        propertyId: property2.realEstateProperty.id,
        lender: 'Bank of America',
        loanType: 'conventional',
        originalAmount: 380000,
        currentBalance: 365000,
        interestRate: 3.75,
        monthlyPayment: 2250,
        startDate: new Date('2021-06-20'),
        termMonths:360,
      }
    })

    // Add rental income for Property 2 (2 units)
    await prisma.incomeStream.create({
      data: {
        assetId: property2.id,
        userId: userId,
        name: 'Rental Income - Unit A',
        incomeType: 'rental',
        amount: 2200,
        frequency: 'MONTHLY',
        startDate: new Date('2021-07-01'),
        isRecurring: true,
      }
    })

    await prisma.incomeStream.create({
      data: {
        assetId: property2.id,
        userId: userId,
        name: 'Rental Income - Unit B',
        incomeType: 'rental',
        amount: 2100,
        frequency: 'MONTHLY',
        startDate: new Date('2021-07-01'),
        isRecurring: true,
      }
    })

    // Add expenses for Property 2
    await prisma.propertyExpense.create({
      data: {
        propertyId: property2.realEstateProperty.id,
        description: 'Property Tax',
        category: 'PROPERTY_TAX',
        amount: 750,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property2.realEstateProperty.id,
        description: 'Property Insurance',
        category: 'INSURANCE',
        amount: 200,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property2.realEstateProperty.id,
        description: 'Maintenance & Repairs',
        category: 'MAINTENANCE',
        amount: 300,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    console.log('✅ Property 2 created: 456 Elm Avenue Duplex, Dallas')

    // Property 3: Condo in Houston
    const property3 = await prisma.asset.create({
      data: {
        userId: userId,
        assetType: 'real_estate',
        name: '789 River Tower #1205',
        currentValue: 285000,
        costBasis: 265000,
        realEstateProperty: {
          create: {
            address: '789 River Tower #1205',
            city: 'Houston',
            state: 'TX',
            zipCode: '77002',
            propertyType: 'CONDO',
            purchasePrice: 265000,
            purchaseDate: new Date('2022-11-10'),
            currentValue: 285000,
            squareFeet: 1100,
            bedrooms: 2,
            bathrooms: 2,
          }
        }
      },
      include: {
        realEstateProperty: true
      }
    })

    // Add mortgage for Property 3
    await prisma.propertyMortgage.create({
      data: {
        propertyId: property3.realEstateProperty.id,
        lender: 'Chase Bank',
        loanType: 'conventional',
        originalAmount: 212000,
        currentBalance: 205000,
        interestRate: 5.25,
        monthlyPayment: 1425,
        startDate: new Date('2022-11-10'),
        termMonths:360,
      }
    })

    // Add rental income for Property 3
    await prisma.incomeStream.create({
      data: {
        assetId: property3.id,
        userId: userId,
        name: 'Rental Income',
        incomeType: 'rental',
        amount: 2000,
        frequency: 'MONTHLY',
        startDate: new Date('2022-12-01'),
        isRecurring: true,
      }
    })

    // Add expenses for Property 3
    await prisma.propertyExpense.create({
      data: {
        propertyId: property3.realEstateProperty.id,
        description: 'Property Tax',
        category: 'PROPERTY_TAX',
        amount: 400,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property3.realEstateProperty.id,
        description: 'HOA/Condo Fees',
        category: 'OTHER',
        amount: 350,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property3.realEstateProperty.id,
        description: 'Condo Insurance',
        category: 'INSURANCE',
        amount: 75,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    console.log('✅ Property 3 created: 789 River Tower #1205, Houston')

    // Property 4: Commercial Property in San Antonio
    const property4 = await prisma.asset.create({
      data: {
        userId: userId,
        assetType: 'real_estate',
        name: '321 Commerce Plaza',
        currentValue: 850000,
        costBasis: 750000,
        realEstateProperty: {
          create: {
            address: '321 Commerce Plaza',
            city: 'San Antonio',
            state: 'TX',
            zipCode: '78205',
            propertyType: 'COMMERCIAL',
            purchasePrice: 750000,
            purchaseDate: new Date('2019-08-05'),
            currentValue: 850000,
            squareFeet: 5500,
          }
        }
      },
      include: {
        realEstateProperty: true
      }
    })

    // Add mortgage for Property 4
    await prisma.propertyMortgage.create({
      data: {
        propertyId: property4.realEstateProperty.id,
        lender: 'Commercial Bank of Texas',
        loanType: 'conventional',
        originalAmount: 525000,
        currentBalance: 475000,
        interestRate: 4.5,
        monthlyPayment: 3200,
        startDate: new Date('2019-08-05'),
        termMonths:240, // 20 years for commercial
      }
    })

    // Add rental income for Property 4
    await prisma.incomeStream.create({
      data: {
        assetId: property4.id,
        userId: userId,
        name: 'Commercial Lease - Tenant A',
        incomeType: 'rental',
        amount: 4500,
        frequency: 'MONTHLY',
        startDate: new Date('2019-09-01'),
        isRecurring: true,
      }
    })

    await prisma.incomeStream.create({
      data: {
        assetId: property4.id,
        userId: userId,
        name: 'Commercial Lease - Tenant B',
        incomeType: 'rental',
        amount: 2800,
        frequency: 'MONTHLY',
        startDate: new Date('2020-01-01'),
        isRecurring: true,
      }
    })

    // Add expenses for Property 4
    await prisma.propertyExpense.create({
      data: {
        propertyId: property4.realEstateProperty.id,
        description: 'Property Tax',
        category: 'PROPERTY_TAX',
        amount: 1250,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property4.realEstateProperty.id,
        description: 'Commercial Property Insurance',
        category: 'INSURANCE',
        amount: 450,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property4.realEstateProperty.id,
        description: 'Property Management',
        category: 'MANAGEMENT',
        amount: 585, // 8% of rent
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    await prisma.propertyExpense.create({
      data: {
        propertyId: property4.realEstateProperty.id,
        description: 'Maintenance & Repairs',
        category: 'MAINTENANCE',
        amount: 500,
        date: new Date('2024-01-01'),
        recurring: true,
      }
    })

    console.log('✅ Property 4 created: 321 Commerce Plaza, San Antonio')

    console.log('\n🎉 All mock data created successfully!')
    console.log('\nPortfolio Summary:')
    console.log('- 4 properties')
    console.log('- Total value: $2,110,000')
    console.log('- Total mortgages: ~$1,330,000')
    console.log('- Monthly rental income: ~$16,400')
    console.log('- Monthly expenses: ~$6,760')
    console.log('- Net monthly cash flow: ~$9,640')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error seeding data:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

seedUserData()
