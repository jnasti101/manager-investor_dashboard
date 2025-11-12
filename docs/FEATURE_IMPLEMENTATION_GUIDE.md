# Feature Implementation Guide
## AI-Powered Wealth Management Platform

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Step-by-step instructions for implementing each feature

---

## How to Use This Guide

This guide is organized by feature category. Each feature includes:

1. **Overview** - What the feature does and why it's important
2. **Dependencies** - What must be completed before this feature
3. **Database Changes** - Schema modifications needed
4. **API Endpoints** - Backend endpoints to create
5. **UI Components** - Frontend components to build
6. **Implementation Steps** - Detailed step-by-step instructions
7. **Testing Checklist** - What to test before marking complete
8. **Estimated Effort** - Time estimate for completion

Follow the implementation roadmap for the recommended sequence.

---

# Foundation Features

## Feature 1.1: Database Setup & Schema

### Overview
Set up PostgreSQL database and create initial schema for users, assets, liabilities, goals, and recommendations.

### Dependencies
- None (first feature)

### Estimated Effort
8-12 hours

### Implementation Steps

#### Step 1: Choose Database Provider
```bash
# Option A: Supabase (recommended for simplicity)
# Go to supabase.com, create project, get connection string

# Option B: Neon (recommended for scale)
# Go to neon.tech, create project, get connection string

# Option C: Railway (good for prototyping)
# Go to railway.app, create PostgreSQL service
```

#### Step 2: Install Dependencies
```bash
npm install prisma @prisma/client
npm install -D prisma
```

#### Step 3: Initialize Prisma
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

#### Step 4: Configure Database Connection
Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

#### Step 5: Create Initial Schema
Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  role          Role      @default(CLIENT)
  passwordHash  String
  mfaEnabled    Boolean   @default(false)
  mfaSecret     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  assets        Asset[]
  liabilities   Liability[]
  goals         Goal[]
  incomeStreams IncomeStream[]
  expenses      Expense[]
  recommendations Recommendation[]

  // For advisors
  clients       ClientRelationship[] @relation("AdvisorClients")

  // For clients with advisors
  advisors      ClientRelationship[] @relation("ClientAdvisors")

  @@index([email])
}

enum Role {
  CLIENT
  ADVISOR
  ADMIN
}

model ClientRelationship {
  id          String   @id @default(uuid())
  advisorId   String
  clientId    String
  status      ClientStatus @default(PENDING)
  createdAt   DateTime @default(now())

  advisor     User     @relation("AdvisorClients", fields: [advisorId], references: [id], onDelete: Cascade)
  client      User     @relation("ClientAdvisors", fields: [clientId], references: [id], onDelete: Cascade)

  @@unique([advisorId, clientId])
  @@index([advisorId])
  @@index([clientId])
}

enum ClientStatus {
  PENDING
  ACTIVE
  INACTIVE
}

model AssetCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  icon        String?

  assets      Asset[]
}

model Asset {
  id              String    @id @default(uuid())
  userId          String
  categoryId      String?
  assetType       String    // "real_estate", "stock", "bond", etc.
  name            String
  currentValue    Decimal   @db.Decimal(15, 2)
  costBasis       Decimal?  @db.Decimal(15, 2)
  acquisitionDate DateTime?
  metadata        Json      @default("{}")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        AssetCategory? @relation(fields: [categoryId], references: [id])

  valuations      AssetValuation[]
  incomeStreams   IncomeStream[]

  @@index([userId])
  @@index([assetType])
}

model AssetValuation {
  id        String   @id @default(uuid())
  assetId   String
  value     Decimal  @db.Decimal(15, 2)
  date      DateTime @default(now())
  source    String?  // "manual", "plaid", "zillow", "api"

  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@index([assetId])
  @@index([date])
}

model Liability {
  id              String    @id @default(uuid())
  userId          String
  liabilityType   String    // "mortgage", "student_loan", "credit_card", etc.
  name            String
  currentBalance  Decimal   @db.Decimal(15, 2)
  originalAmount  Decimal?  @db.Decimal(15, 2)
  interestRate    Decimal?  @db.Decimal(5, 2)
  minimumPayment  Decimal?  @db.Decimal(10, 2)
  dueDate         DateTime?
  metadata        Json      @default("{}")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  payments        LiabilityPayment[]

  @@index([userId])
}

model LiabilityPayment {
  id            String    @id @default(uuid())
  liabilityId   String
  amount        Decimal   @db.Decimal(10, 2)
  paymentDate   DateTime
  principalPaid Decimal?  @db.Decimal(10, 2)
  interestPaid  Decimal?  @db.Decimal(10, 2)

  liability     Liability @relation(fields: [liabilityId], references: [id], onDelete: Cascade)

  @@index([liabilityId])
  @@index([paymentDate])
}

model Goal {
  id            String    @id @default(uuid())
  userId        String
  goalType      String    // "retirement", "education", "purchase", etc.
  name          String
  targetAmount  Decimal?  @db.Decimal(15, 2)
  currentAmount Decimal   @db.Decimal(15, 2) @default(0)
  targetDate    DateTime?
  priority      Int       @default(0)
  status        GoalStatus @default(PLANNING)
  metadata      Json      @default("{}")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  milestones    GoalMilestone[]

  @@index([userId])
  @@index([goalType])
}

enum GoalStatus {
  PLANNING
  IN_PROGRESS
  ON_TRACK
  AT_RISK
  ACHIEVED
  ABANDONED
}

model GoalMilestone {
  id          String    @id @default(uuid())
  goalId      String
  name        String
  targetDate  DateTime
  targetValue Decimal?  @db.Decimal(15, 2)
  achieved    Boolean   @default(false)
  achievedAt  DateTime?

  goal        Goal      @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
}

model IncomeStream {
  id          String    @id @default(uuid())
  userId      String
  assetId     String?
  incomeType  String    // "salary", "rental", "dividend", etc.
  name        String
  amount      Decimal   @db.Decimal(10, 2)
  frequency   Frequency
  startDate   DateTime
  endDate     DateTime?
  isRecurring Boolean   @default(true)
  metadata    Json      @default("{}")

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset       Asset?    @relation(fields: [assetId], references: [id])

  @@index([userId])
  @@index([incomeType])
}

enum Frequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
  ONE_TIME
}

model Expense {
  id          String    @id @default(uuid())
  userId      String
  category    String
  subcategory String?
  amount      Decimal   @db.Decimal(10, 2)
  date        DateTime
  description String?
  isRecurring Boolean   @default(false)
  frequency   Frequency?
  metadata    Json      @default("{}")

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([category])
  @@index([date])
}

model Recommendation {
  id            String    @id @default(uuid())
  userId        String
  type          String    // "portfolio", "tax", "goal", "cash_flow"
  title         String
  description   String
  priority      Priority
  status        RecommendationStatus @default(PENDING)
  source        RecommendationSource @default(AI)
  createdById   String?
  actionItems   Json      @default("[]")
  metadata      Json      @default("{}")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  dismissedAt   DateTime?
  implementedAt DateTime?

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum RecommendationStatus {
  PENDING
  DISMISSED
  IN_PROGRESS
  IMPLEMENTED
}

enum RecommendationSource {
  AI
  ADVISOR
  SYSTEM
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  resourceId String?
  metadata  Json     @default("{}")
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
  @@index([resource, resourceId])
}
```

#### Step 6: Run Migration
```bash
npx prisma migrate dev --name init
```

#### Step 7: Generate Prisma Client
```bash
npx prisma generate
```

#### Step 8: Create Prisma Client Instance
Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

#### Step 9: Verify Connection
Create `scripts/test-db.ts`:
```typescript
import { prisma } from '../lib/prisma'

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)

  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

Run test:
```bash
npx tsx scripts/test-db.ts
```

### Testing Checklist
- [ ] Database connection succeeds
- [ ] Prisma client generates without errors
- [ ] Can run simple queries (count)
- [ ] All models are created in database
- [ ] Migrations run successfully

### Common Issues & Solutions

**Issue:** Connection timeout
- **Solution:** Check firewall rules, ensure IP is whitelisted in database provider

**Issue:** SSL certificate error
- **Solution:** Add `?sslmode=require` to connection string

**Issue:** Permission denied
- **Solution:** Verify database user has correct permissions

---

## Feature 1.2: Authentication System

### Overview
Implement user authentication with NextAuth.js including email/password login, registration, and MFA support.

### Dependencies
- Feature 1.1: Database Setup (User model must exist)

### Estimated Effort
12-16 hours

### Implementation Steps

#### Step 1: Install Dependencies
```bash
npm install next-auth@beta
npm install bcryptjs
npm install @types/bcryptjs -D
npm install speakeasy qrcode
npm install @types/speakeasy @types/qrcode -D
```

#### Step 2: Generate Auth Secret
```bash
openssl rand -base64 32
```

Add to `.env`:
```env
AUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### Step 3: Create Auth Configuration
Create `lib/auth.ts`:
```typescript
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
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, password, mfaToken } = validated.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        // Check MFA if enabled
        if (user.mfaEnabled) {
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
      if (token) {
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
```

#### Step 4: Create Auth API Route
Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

#### Step 5: Update Session Type
Create `types/next-auth.d.ts`:
```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

#### Step 6: Create Registration API
Create `app/api/auth/register/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = registerSchema.parse(body)

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        role: 'CLIENT',
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
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Step 7: Create Login Page
Update `app/auth/login/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [showMfa, setShowMfa] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        mfaToken: showMfa ? mfaToken : undefined,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'MFA_REQUIRED') {
          setShowMfa(true)
          setError('Please enter your MFA code')
        } else {
          setError('Invalid email or password')
        }
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {showMfa && (
              <Input
                label="MFA Code"
                type="text"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

#### Step 8: Create Registration Page
Update `app/auth/signup/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Auto-login after registration
      router.push('/auth/login?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

#### Step 9: Create Auth Middleware
Create `middleware.ts`:
```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/signup', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

#### Step 10: Create Session Provider
Update `app/providers.tsx`:
```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.Node }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Update `app/layout.tsx`:
```typescript
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Testing Checklist
- [ ] User can register with email and password
- [ ] Duplicate email registration is prevented
- [ ] Password is hashed in database (never plaintext)
- [ ] User can log in with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Authenticated users can access protected routes
- [ ] Unauthenticated users are redirected to login
- [ ] Session persists after page refresh
- [ ] Logout functionality works
- [ ] MFA setup and verification works

### Common Issues & Solutions

**Issue:** "Configuration" error from NextAuth
- **Solution:** Ensure AUTH_SECRET is set in .env

**Issue:** Session not persisting
- **Solution:** Check cookie settings, ensure NEXTAUTH_URL is correct

**Issue:** Infinite redirect loop
- **Solution:** Check middleware matcher pattern, ensure auth routes are excluded

---

## Feature 1.3: Real Estate Asset Management

### Overview
Create CRUD operations for real estate assets with property details, images, and documents.

### Dependencies
- Feature 1.1: Database Setup (Asset model must exist)
- Feature 1.2: Authentication (user context required)

### Estimated Effort
16-20 hours

### Implementation Steps

#### Step 1: Extend Asset Model for Real Estate
Add to `prisma/schema.prisma` if not already present:
```prisma
model RealEstateProperty {
  id              String    @id @default(uuid())
  assetId         String    @unique
  address         String
  city            String
  state           String
  zipCode         String
  propertyType    PropertyType
  bedrooms        Int?
  bathrooms       Decimal?  @db.Decimal(3, 1)
  squareFeet      Int?
  yearBuilt       Int?
  purchasePrice   Decimal   @db.Decimal(15, 2)
  purchaseDate    DateTime
  currentValue    Decimal   @db.Decimal(15, 2)

  asset           Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  images          PropertyImage[]
  documents       PropertyDocument[]
  expenses        PropertyExpense[]

  @@index([assetId])
}

enum PropertyType {
  SINGLE_FAMILY
  MULTI_FAMILY
  CONDO
  TOWNHOUSE
  COMMERCIAL
  LAND
  OTHER
}

model PropertyImage {
  id         String   @id @default(uuid())
  propertyId String
  url        String
  caption    String?
  order      Int      @default(0)
  createdAt  DateTime @default(now())

  property   RealEstateProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

model PropertyDocument {
  id         String   @id @default(uuid())
  propertyId String
  name       String
  type       DocumentType
  url        String
  uploadedAt DateTime @default(now())

  property   RealEstateProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

enum DocumentType {
  DEED
  LEASE
  INSURANCE
  TAX_RECORD
  INSPECTION
  APPRAISAL
  OTHER
}

model PropertyExpense {
  id          String    @id @default(uuid())
  propertyId  String
  category    ExpenseCategory
  amount      Decimal   @db.Decimal(10, 2)
  date        DateTime
  description String?
  recurring   Boolean   @default(false)

  property    RealEstateProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([date])
}

enum ExpenseCategory {
  MORTGAGE
  PROPERTY_TAX
  INSURANCE
  HOA
  MAINTENANCE
  UTILITIES
  MANAGEMENT
  OTHER
}
```

Run migration:
```bash
npx prisma migrate dev --name add_real_estate_models
npx prisma generate
```

#### Step 2: Create Property API Routes

Create `app/api/properties/route.ts`:
```typescript
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
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
```

Create `app/api/properties/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single property
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const property = await prisma.asset.findFirst({
      where: {
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const property = await prisma.$transaction(async (tx) => {
      // Update asset
      await tx.asset.update({
        where: { id: params.id },
        data: {
          name: body.name,
          currentValue: body.currentValue,
        },
      })

      // Update real estate property
      const updated = await tx.realEstateProperty.update({
        where: { assetId: params.id },
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
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        assetType: 'real_estate',
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await prisma.asset.delete({
      where: { id: params.id },
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
```

#### Step 3: Create Property Form Component

Create `components/properties/property-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface PropertyFormProps {
  property?: any // For editing existing property
  onSuccess?: () => void
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.realEstateProperty?.address || '',
    city: property?.realEstateProperty?.city || '',
    state: property?.realEstateProperty?.state || '',
    zipCode: property?.realEstateProperty?.zipCode || '',
    propertyType: property?.realEstateProperty?.propertyType || 'SINGLE_FAMILY',
    bedrooms: property?.realEstateProperty?.bedrooms || '',
    bathrooms: property?.realEstateProperty?.bathrooms || '',
    squareFeet: property?.realEstateProperty?.squareFeet || '',
    yearBuilt: property?.realEstateProperty?.yearBuilt || '',
    purchasePrice: property?.realEstateProperty?.purchasePrice || '',
    purchaseDate: property?.realEstateProperty?.purchaseDate?.split('T')[0] || '',
    currentValue: property?.currentValue || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = property
        ? `/api/properties/${property.id}`
        : '/api/properties'
      const method = property ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms as string) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms as string) : null,
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet as string) : null,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt as string) : null,
          purchasePrice: parseFloat(formData.purchasePrice as string),
          currentValue: parseFloat(formData.currentValue as string),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save property')
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/properties')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Property Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="e.g., Downtown Apartment"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
            placeholder="123 Main St"
          />
        </div>

        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          required
        />

        <Input
          label="State"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
          required
          maxLength={2}
          placeholder="CA"
        />

        <Input
          label="ZIP Code"
          value={formData.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Property Type
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            required
          >
            <option value="SINGLE_FAMILY">Single Family</option>
            <option value="MULTI_FAMILY">Multi-Family</option>
            <option value="CONDO">Condo</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="LAND">Land</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <Input
          label="Bedrooms"
          type="number"
          value={formData.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
        />

        <Input
          label="Bathrooms"
          type="number"
          step="0.5"
          value={formData.bathrooms}
          onChange={(e) => handleChange('bathrooms', e.target.value)}
        />

        <Input
          label="Square Feet"
          type="number"
          value={formData.squareFeet}
          onChange={(e) => handleChange('squareFeet', e.target.value)}
        />

        <Input
          label="Year Built"
          type="number"
          value={formData.yearBuilt}
          onChange={(e) => handleChange('yearBuilt', e.target.value)}
        />

        <Input
          label="Purchase Price"
          type="number"
          step="0.01"
          value={formData.purchasePrice}
          onChange={(e) => handleChange('purchasePrice', e.target.value)}
          required
        />

        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => handleChange('purchaseDate', e.target.value)}
          required
        />

        <Input
          label="Current Value"
          type="number"
          step="0.01"
          value={formData.currentValue}
          onChange={(e) => handleChange('currentValue', e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
        </Button>
      </div>
    </form>
  )
}
```

#### Step 4: Create Properties List Page

Create `app/dashboard/properties/page.tsx`:
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function PropertiesPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

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
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <Link href="/dashboard/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 mb-4">No properties yet</p>
            <Link href="/dashboard/properties/new">
              <Button>Add Your First Property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const reProperty = property.realEstateProperty
            const image = reProperty?.images[0]

            return (
              <Link
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  {image && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {property.name}
                    </h3>
                    {reProperty && (
                      <p className="text-sm text-gray-600 mt-1">
                        {reProperty.address}, {reProperty.city}, {reProperty.state}
                      </p>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(Number(property.currentValue))}
                        </p>
                      </div>
                      {reProperty && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="text-sm font-medium text-gray-900">
                            {reProperty.propertyType.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

#### Step 5: Create New Property Page

Create `app/dashboard/properties/new/page.tsx`:
```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PropertyForm } from '@/components/properties/property-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function NewPropertyPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Testing Checklist
- [ ] User can create a new property
- [ ] All form fields validate correctly
- [ ] Property appears in properties list
- [ ] User can view property details
- [ ] User can edit property information
- [ ] User can delete property
- [ ] Only property owner can access/edit/delete
- [ ] Form handles errors gracefully
- [ ] Images display correctly (if uploaded)
- [ ] Property data persists after page refresh

### Common Issues & Solutions

**Issue:** Form submission fails with validation error
- **Solution:** Check that all required fields are filled and formatted correctly (e.g., state is 2 characters)

**Issue:** Property doesn't appear in list immediately
- **Solution:** Call `router.refresh()` after successful creation

**Issue:** Unauthorized error when accessing property
- **Solution:** Ensure middleware is protecting routes and session is valid

---

## Feature 1.4: Real Estate Debt Tracking

### Overview
Track mortgages and loans associated with properties, calculate amortization schedules, and show debt service.

### Dependencies
- Feature 1.1: Database Setup (Liability model must exist)
- Feature 1.2: Authentication
- Feature 1.3: Real Estate Asset Management

### Estimated Effort
12-16 hours

### Implementation Steps

*Due to the extensive length of this document, I'm providing the structure for the remaining features. Each would follow a similar detailed format with steps, code examples, and testing checklists.*

---

## Remaining Features Summary

### Phase 1: Foundation & Real Estate (Weeks 1-4)
- ✅ Feature 1.1: Database Setup (detailed above)
- ✅ Feature 1.2: Authentication System (detailed above)
- ✅ Feature 1.3: Real Estate Asset Management (detailed above)
- 📝 Feature 1.4: Real Estate Debt Tracking
- 📝 Feature 1.5: Rental Income & Expense Tracking
- 📝 Feature 1.6: Real Estate Cash Flow Dashboard

### Phase 2: Investment Portfolio (Weeks 5-8)
- 📝 Feature 2.1: Investment Account Framework
- 📝 Feature 2.2: Securities & Holdings
- 📝 Feature 2.3: Market Data Integration (Alpha Vantage/Polygon)
- 📝 Feature 2.4: Investment Portfolio Dashboard

### Phase 3: Comprehensive Financial Tracking (Weeks 9-12)
- 📝 Feature 3.1: Alternative Assets & Business Interests
- 📝 Feature 3.2: Cryptocurrency Tracking
- 📝 Feature 3.3: Comprehensive Liability Management
- 📝 Feature 3.4: Income & Expense Tracking with AI Categorization

### Phase 4: Financial Planning (Weeks 13-16)
- 📝 Feature 4.1: Financial Goal Framework
- 📝 Feature 4.2: Retirement Planning Calculator
- 📝 Feature 4.3: Education & Major Purchase Planning
- 📝 Feature 4.4: Estate & Legacy Planning

### Phase 5: AI Integration - Phase 1 (Weeks 17-20)
- 📝 Feature 5.1: AI Infrastructure Setup (Anthropic Claude)
- 📝 Feature 5.2: Portfolio Analysis AI
- 📝 Feature 5.3: Financial Planning AI
- 📝 Feature 5.4: Cash Flow & Expense AI

### Phase 6: Plaid Integration (Weeks 21-24)
- 📝 Feature 6.1: Plaid Foundation & Account Linking
- 📝 Feature 6.2: Transaction Sync & Reconciliation
- 📝 Feature 6.3: Investment Account Sync
- 📝 Feature 6.4: Additional Integrations (Zillow, tax software)

### Phase 7: Advanced AI (Weeks 25-28)
- 📝 Feature 7.1: Tax Optimization AI
- 📝 Feature 7.2: Market Analysis & Insights
- 📝 Feature 7.3: Financial Projections (Monte Carlo)
- 📝 Feature 7.4: AI Financial Assistant (Chatbot with RAG)

### Phase 8: Advisor Platform (Weeks 29-32)
- 📝 Feature 8.1: Advisor Accounts & Client Management
- 📝 Feature 8.2: Advisor Dashboard & Analytics
- 📝 Feature 8.3: Manual Recommendations & Communication
- 📝 Feature 8.4: Advisor Reporting & Compliance

### Phase 9: Reporting & Analytics (Weeks 33-36)
- 📝 Feature 9.1: Interactive Customizable Dashboards
- 📝 Feature 9.2: Advanced Report Builder
- 📝 Feature 9.3: Data Export & Public API
- 📝 Feature 9.4: Analytics & Insights Platform

### Phase 10: Mobile & PWA (Weeks 37-40)
- 📝 Feature 10.1: Mobile-First Redesign
- 📝 Feature 10.2: Progressive Web App
- 📝 Feature 10.3: Mobile Performance Optimization
- 📝 Feature 10.4: Native Mobile Features (biometrics, camera, etc.)

### Phase 11: Compliance & Scaling (Weeks 41-44)
- 📝 Feature 11.1: Security Hardening
- 📝 Feature 11.2: SOC 2 Compliance
- 📝 Feature 11.3: GDPR & CCPA Compliance
- 📝 Feature 11.4: Scaling & Performance

### Phase 12: Polish & Launch (Weeks 45-48)
- 📝 Feature 12.1: UX Polish & Animations
- 📝 Feature 12.2: Documentation & Training
- 📝 Feature 12.3: Beta Testing & Bug Fixes
- 📝 Feature 12.4: Launch Preparation

---

## Quick Reference: Common Patterns

### API Route Pattern
```typescript
// app/api/[resource]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await prisma.resource.findMany({
      where: { userId: session.user.id },
    })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### Server Component Pattern
```typescript
// app/dashboard/[page]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const data = await prisma.resource.findMany({
    where: { userId: session.user.id },
  })

  return <div>{/* Render data */}</div>
}
```

### Client Component Pattern
```typescript
// components/[feature]/[component].tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Component() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return <div>{/* Component UI */}</div>
}
```

---

## Development Best Practices

### 1. Testing Strategy
- Write tests for all API routes
- Test authentication and authorization
- Test database operations (CRUD)
- Test form validation
- Test error handling

### 2. Error Handling
- Always use try-catch in API routes
- Return appropriate HTTP status codes
- Log errors server-side
- Show user-friendly messages client-side

### 3. Performance
- Use database indexes for common queries
- Implement pagination for lists
- Use React Server Components where possible
- Lazy load heavy components
- Optimize images

### 4. Security
- Never expose sensitive data in API responses
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Use HTTPS in production
- Set secure cookie flags

### 5. Code Organization
```
app/
  api/           # API routes
  dashboard/     # Dashboard pages
  auth/          # Auth pages
components/
  ui/            # Reusable UI components
  [feature]/     # Feature-specific components
lib/
  auth.ts        # Auth config
  prisma.ts      # Prisma client
  utils.ts       # Utility functions
types/           # TypeScript types
prisma/
  schema.prisma  # Database schema
```

---

## Next Steps

1. **Complete Phase 1** following the detailed instructions for features 1.1-1.3
2. **Test thoroughly** using the testing checklists
3. **Deploy to staging** environment
4. **Gather feedback** from early users
5. **Proceed to Phase 2** using similar patterns

---

**Document End**

For detailed implementation of features not fully documented here, follow the same pattern:
1. Database schema changes
2. API routes (GET, POST, PUT, DELETE)
3. UI components (forms, lists, details)
4. Testing checklist
5. Common issues and solutions

Each feature should be implemented, tested, and deployed before moving to the next.
