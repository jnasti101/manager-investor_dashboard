/**
 * Script to set a user's role to MANAGER
 * Usage: npx tsx scripts/set-manager-role.ts <email>
 */

import { prisma } from '../lib/prisma'

async function setManagerRole(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ User with email "${email}" not found`)
      process.exit(1)
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'MANAGER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    console.log('✅ User role updated successfully:')
    console.log(`   Name: ${updated.name}`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   Role: ${updated.role}`)
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: npx tsx scripts/set-manager-role.ts <email>')
  process.exit(1)
}

setManagerRole(email)
