import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME']),
  startDate: z.string(),
  endDate: z.string().optional(),
  incomeType: z.string().default('rental'),
})

// GET all income streams for a property
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
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const incomeStreams = await prisma.incomeStream.findMany({
      where: {
        assetId: id,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ incomeStreams })
  } catch (error) {
    console.error('Error fetching income streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income streams' },
      { status: 500 }
    )
  }
}

// POST create new income stream
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
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await req.json()
    const validated = incomeSchema.parse(body)

    const incomeStream = await prisma.incomeStream.create({
      data: {
        userId: session.user.id,
        assetId: id,
        name: validated.name,
        amount: validated.amount,
        frequency: validated.frequency,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        incomeType: validated.incomeType,
        isRecurring: validated.frequency !== 'ONE_TIME',
      },
    })

    return NextResponse.json({ incomeStream }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating income stream:', error)
    return NextResponse.json(
      { error: 'Failed to create income stream' },
      { status: 500 }
    )
  }
}
