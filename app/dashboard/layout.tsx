import { Navbar } from '@/components/dashboard/navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, role: true }
    })

    // If user exists in Auth but not DB (shouldn't happen ideally)
    if (!dbUser) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar userName={dbUser.name || 'User'} userRole={dbUser.role.toLowerCase()} />
            {children}
        </div>
    )
}
