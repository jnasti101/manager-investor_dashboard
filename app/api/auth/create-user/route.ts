import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['CLIENT', 'MANAGER', 'ADVISOR', 'ADMIN']).default('CLIENT'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = createUserSchema.parse(body)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: validated.id,
        email: validated.email,
        name: validated.name,
        role: validated.role,
        // No password hash needed - Supabase Auth handles authentication
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
