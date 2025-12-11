import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PropertyTaxService } from '@/lib/services/property-tax-service'
import { auth } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { currentAssessedValue, targetAssessedValue, taxYear } = body

        // Verify property belongs to user (or user is manager)
        const property = await prisma.realEstateProperty.findUnique({
            where: { id },
            include: { asset: true }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        // TODO: Add strict ownership check here based on user role

        const appeal = await PropertyTaxService.createAppeal(
            id,
            currentAssessedValue,
            targetAssessedValue,
            taxYear
        )

        return NextResponse.json(appeal)
    } catch (error) {
        console.error('Error creating appeal:', error)
        return NextResponse.json(
            { error: 'Failed to create appeal' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const appeal = await PropertyTaxService.getActiveAppeal(id)

        return NextResponse.json(appeal || null)
    } catch (error) {
        console.error('Error fetching appeal:', error)
        return NextResponse.json(
            { error: 'Failed to fetch appeal' },
            { status: 500 }
        )
    }
}
