import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const propertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().min(5),
  propertyType: z.enum(['SINGLE_FAMILY', 'MULTI_FAMILY', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND', 'OTHER']),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  squareFeet: z.number().int().optional(),
  yearBuilt: z.number().int().optional(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string(), // ISO date string
  currentValue: z.number().positive(),
})

// GET all properties for user
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const properties = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST create new property
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validated = propertySchema.parse(body)

    const property = await prisma.$transaction(async (tx) => {
      // Create asset
      const asset = await tx.asset.create({
        data: {
          userId: session.user.id,
          assetType: 'real_estate',
          name: validated.name,
          currentValue: validated.currentValue,
          costBasis: validated.purchasePrice,
          acquisitionDate: new Date(validated.purchaseDate),
        },
      })

      // Create real estate property
      const reProperty = await tx.realEstateProperty.create({
        data: {
          assetId: asset.id,
          address: validated.address,
          city: validated.city,
          state: validated.state,
          zipCode: validated.zipCode,
          propertyType: validated.propertyType,
          bedrooms: validated.bedrooms,
          bathrooms: validated.bathrooms,
          squareFeet: validated.squareFeet,
          yearBuilt: validated.yearBuilt,
          purchasePrice: validated.purchasePrice,
          purchaseDate: new Date(validated.purchaseDate),
          currentValue: validated.currentValue,
        },
        include: {
          asset: true,
        },
      })

      return reProperty
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
