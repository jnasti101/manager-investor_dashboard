const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!', result)

    // Try to count users
    const userCount = await prisma.user.count()
    console.log(`Found ${userCount} users in database`)

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
