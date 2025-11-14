import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaToken: z.string().optional(),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaToken: { label: 'MFA Token', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Starting authorization...')
        console.log('[AUTH] Credentials received:', { email: credentials?.email, hasPassword: !!credentials?.password })

        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) {
          console.log('[AUTH] Validation failed:', validated.error)
          return null
        }

        const { email, password, mfaToken } = validated.data
        console.log('[AUTH] Looking up user:', email)

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          console.log('[AUTH] User not found')
          return null
        }

        console.log('[AUTH] User found:', { id: user.id, email: user.email, role: user.role, hasPasswordHash: !!user.passwordHash })

        if (!user.passwordHash) {
          console.log('[AUTH] No password hash found')
          return null
        }

        console.log('[AUTH] Comparing passwords...')
        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        console.log('[AUTH] Password match:', passwordMatch)

        if (!passwordMatch) return null

        // Check MFA if enabled
        if (user.mfaEnabled) {
          console.log('[AUTH] MFA is enabled')
          if (!mfaToken || !user.mfaSecret) return null

          const speakeasy = require('speakeasy')
          const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: mfaToken,
            window: 2,
          })

          if (!verified) return null
        }

        console.log('[AUTH] Authorization successful!')
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
