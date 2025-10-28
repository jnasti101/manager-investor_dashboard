import Link from 'next/link'
import { Building2, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Building2 className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Real Estate Portfolio Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track, analyze, and optimize your real estate investments with powerful tools for investors and managers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TrendingUp className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
            <p className="text-gray-600">
              Monitor cash flow, ROI, and key metrics across your entire portfolio.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <Building2 className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Manage Properties</h3>
            <p className="text-gray-600">
              Keep all property data, loans, and expenses organized in one place.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <Users className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-gray-600">
              Managers and investors work together with insights and recommendations.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-indigo-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
