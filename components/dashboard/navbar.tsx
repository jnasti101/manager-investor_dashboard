import Link from 'next/link'
import { Building2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  userName: string
  userRole: string
}

export function Navbar({ userName, userRole }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="font-bold text-xl text-gray-900">RE Portfolio</h1>
              <p className="text-xs text-gray-600 capitalize">{userRole} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
