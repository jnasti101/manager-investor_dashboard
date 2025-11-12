'use client'

import Link from 'next/link'
import { Building2, LogOut, Home, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

interface NavbarProps {
  userName: string
  userRole: string
}

export function Navbar({ userName, userRole }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    console.log('🔴 [LOGOUT] Button clicked - starting logout process')

    try {
      console.log('🔴 [LOGOUT] Calling signOut...')
      await signOut({
        redirect: false,  // We'll handle redirect manually
      })
      console.log('🔴 [LOGOUT] signOut completed successfully')

      console.log('🔴 [LOGOUT] Redirecting to /login...')
      router.push('/login')
      console.log('🔴 [LOGOUT] Router.push called')

      // Force a hard refresh to clear any cached data
      setTimeout(() => {
        console.log('🔴 [LOGOUT] Forcing page refresh')
        window.location.href = '/login'
      }, 100)

    } catch (error) {
      console.error('🔴 [LOGOUT] Error during logout:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/investor" className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="font-bold text-xl text-gray-900">Wealth Manager</h1>
                <p className="text-xs text-gray-600 capitalize">{userRole} Dashboard</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard/investor"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard/investor'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/properties"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith('/dashboard/properties')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Properties
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
