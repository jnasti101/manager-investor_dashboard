import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const mortgageSchema = z.object({
  lender: z.string().min(1),
  loanType: z.string().min(1),
  originalAmount: z.number().positive(),
  currentBalance: z.number().positive(),
  interestRate: z.number().positive().max(100),
  termMonths: z.number().int().positive(),
  startDate: z.string(),
  monthlyPayment: z.number().positive(),
})

// GET all mortgages for a property
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify property ownership
    const property = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: {
          include: {
            mortgages: {
              orderBy: { startDate: 'desc' },
            },
          },
        },
      },
    })

    if (!property || !property.realEstateProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ mortgages: property.realEstateProperty.mortgages })
  } catch (error) {
    console.error('Error fetching mortgages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mortgages' },
      { status: 500 }
    )
  }
}

// POST create new mortgage
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify property ownership
    const property = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: true,
      },
    })

    if (!property || !property.realEstateProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await req.json()
    const validated = mortgageSchema.parse(body)

    const mortgage = await prisma.propertyMortgage.create({
      data: {
        propertyId: property.realEstateProperty.id,
        lender: validated.lender,
        loanType: validated.loanType,
        originalAmount: validated.originalAmount,
        currentBalance: validated.currentBalance,
        interestRate: validated.interestRate,
        termMonths: validated.termMonths,
        startDate: new Date(validated.startDate),
        monthlyPayment: validated.monthlyPayment,
      },
    })

    return NextResponse.json({ mortgage }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating mortgage:', error)
    return NextResponse.json(
      { error: 'Failed to create mortgage' },
      { status: 500 }
    )
  }
}
