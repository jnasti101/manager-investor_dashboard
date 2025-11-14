import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const expenseSchema = z.object({
  category: z.enum(['MORTGAGE', 'PROPERTY_TAX', 'INSURANCE', 'HOA', 'MAINTENANCE', 'UTILITIES', 'MANAGEMENT', 'OTHER']),
  amount: z.number().positive(),
  date: z.string(),
  description: z.string().optional(),
  recurring: z.boolean().default(false),
})

// GET all expenses for a property
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify property ownership
    const property = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: true,
      },
    })

    if (!property || !property.realEstateProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const expenses = await prisma.propertyExpense.findMany({
      where: {
        propertyId: property.realEstateProperty.id,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST create new expense
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify property ownership
    const property = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: user.id,
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
    const validated = expenseSchema.parse(body)

    const expense = await prisma.propertyExpense.create({
      data: {
        propertyId: property.realEstateProperty.id,
        category: validated.category,
        amount: validated.amount,
        date: new Date(validated.date),
        description: validated.description,
        recurring: validated.recurring,
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
