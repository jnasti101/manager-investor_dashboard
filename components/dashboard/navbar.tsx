'use client'

import Link from 'next/link'
import { Building2, LogOut, Home, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  userName: string
  userRole: string
}

export function Navbar({ userName, userRole }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/investor" className="flex items-center gap-3">
              <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-white">ApexWealth</h1>
                <p className="text-xs text-slate-400">{userRole} Dashboard</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard/investor"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard/investor'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/properties"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith('/dashboard/properties')
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <Briefcase className="h-4 w-4" />
                Properties
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-white text-sm">{userName}</p>
              <p className="text-xs text-slate-400">Verified Investor</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
