'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Invalid email or password')
        return
      }

      if (data.user) {
        // Get user role from database
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('role')
          .eq('email', email)
          .single()

        if (userError || !userData) {
          setError('Error fetching user data')
          return
        }

        // Redirect based on role
        if (userData.role === 'MANAGER' || userData.role === 'ADVISOR') {
          router.push('/dashboard/manager')
        } else {
          router.push('/dashboard/investor')
        }
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-slate-800">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Building2 className="h-12 w-12 text-emerald-400 mb-2" />
          <CardTitle className="text-2xl font-bold font-display text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-900/50 border border-red-800 p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="w-full glass-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-slate-400">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </div>
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-md text-sm text-slate-300">
            <p className="font-semibold mb-1 text-slate-100">Create an account to get started!</p>
            <p className="text-slate-400">Click &quot;Sign up&quot; above to register.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
