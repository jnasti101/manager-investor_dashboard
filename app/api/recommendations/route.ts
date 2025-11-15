import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const recommendationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
})

// GET all recommendations for a user
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // If userId is provided, fetch recommendations for that user (manager viewing investor's recommendations)
    // Otherwise, fetch recommendations for the authenticated user
    const targetUserId = userId || user.id

    const recommendations = await prisma.recommendation.findMany({
      where: {
        userId: targetUserId,
        dismissedAt: null, // Don't show dismissed recommendations
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

// POST create new recommendation (managers only)
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify user is a manager or advisor
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || (dbUser.role !== 'MANAGER' && dbUser.role !== 'ADVISOR')) {
      return NextResponse.json(
        { error: 'Only managers and advisors can create recommendations' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = recommendationSchema.parse(body)

    const recommendation = await prisma.recommendation.create({
      data: {
        userId: validated.userId,
        type: validated.type,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        status: 'PENDING',
        source: 'ADVISOR',
        createdById: user.id,
      },
    })

    return NextResponse.json({ recommendation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    )
  }
}
