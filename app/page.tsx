import Link from 'next/link'
import { Building2, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold mb-4 text-white">
            Real Estate Portfolio Management
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Track, analyze, and optimize your real estate investments with powerful tools for investors and managers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="glass-card rounded-lg p-6">
            <div className="h-11 w-11 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Track Performance</h3>
            <p className="text-slate-400">
              Monitor cash flow, ROI, and key metrics across your entire portfolio.
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="h-11 w-11 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Manage Properties</h3>
            <p className="text-slate-400">
              Keep all property data, loans, and expenses organized in one place.
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="h-11 w-11 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Collaborate</h3>
            <p className="text-slate-400">
              Managers and investors work together with insights and recommendations.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="glass-button px-8 py-3 rounded-lg font-medium"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors border border-slate-600 text-white"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
