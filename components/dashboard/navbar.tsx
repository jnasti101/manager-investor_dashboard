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
    <nav className="sticky top-4 z-50 mx-4 mt-4 rounded-2xl glass-panel border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/investor" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-white tracking-tight">Apex<span className="text-emerald-400">Wealth</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{userRole} Dashboard</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard/investor"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === '/dashboard/investor'
                    ? 'bg-white/10 text-white shadow-inner border border-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/properties"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname?.startsWith('/dashboard/properties')
                    ? 'bg-white/10 text-white shadow-inner border border-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
              <p className="text-xs text-emerald-400 font-mono">Verified Investor</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
