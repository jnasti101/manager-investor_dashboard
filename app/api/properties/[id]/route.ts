import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET single property
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
    const property = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: {
          include: {
            images: { orderBy: { order: 'asc' } },
            documents: true,
            expenses: { orderBy: { date: 'desc' } },
          },
        },
        incomeStreams: true,
        valuations: { orderBy: { date: 'desc' }, take: 10 },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT update property
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()

    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const property = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update asset
      await tx.asset.update({
        where: { id: id },
        data: {
          name: body.name,
          currentValue: body.currentValue,
        },
      })

      // Update real estate property
      const updated = await tx.realEstateProperty.update({
        where: { assetId: id },
        data: {
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          propertyType: body.propertyType,
          bedrooms: body.bedrooms,
          bathrooms: body.bathrooms,
          squareFeet: body.squareFeet,
          yearBuilt: body.yearBuilt,
          currentValue: body.currentValue,
        },
        include: {
          asset: true,
        },
      })

      return updated
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE property
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await prisma.asset.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}
