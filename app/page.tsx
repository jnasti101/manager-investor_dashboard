import Link from 'next/link'
import { Building2, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Building2 className="h-16 w-16 text-emerald-400" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-4 text-gradient-gold">
            Real Estate Portfolio Management
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Track, analyze, and optimize your real estate investments with powerful tools for investors and managers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="glass-card rounded-lg p-6 text-foreground">
            <TrendingUp className="h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Track Performance</h3>
            <p className="text-gray-400">
              Monitor cash flow, ROI, and key metrics across your entire portfolio.
            </p>
          </div>

          <div className="glass-card rounded-lg p-6 text-foreground">
            <Building2 className="h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Manage Properties</h3>
            <p className="text-gray-400">
              Keep all property data, loans, and expenses organized in one place.
            </p>
          </div>

          <div className="glass-card rounded-lg p-6 text-foreground">
            <Users className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Collaborate</h3>
            <p className="text-gray-400">
              Managers and investors work together with insights and recommendations.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="glass-button px-8 py-3 rounded-lg font-semibold"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg font-semibold hover:bg-slate-800/50 transition border border-slate-700 text-foreground"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
