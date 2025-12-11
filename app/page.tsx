import Link from 'next/link'
import { Building2, TrendingUp, Users, ArrowRight, ShieldCheck, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

          <div className="container px-4 mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              New: Artificial Intelligence Analytics
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Wealth Management <br />
              <span className="text-blue-500">Reimagined</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The professional platform for modern real estate investors. Track assets, analyze performance, and collaborate with your team in one unified dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link href="/signup">
                <Button size="lg" className="glass-button text-lg h-12 px-8 rounded-xl w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="text-lg h-12 px-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: TrendingUp,
                  title: "Real-time Analytics",
                  desc: "Visualize cash flow and ROI with institutional-grade charts."
                },
                {
                  icon: Building2,
                  title: "Asset Management",
                  desc: "Centralize property data, documents, and financial records."
                },
                {
                  icon: Users,
                  title: "Collaborative Tools",
                  desc: "Seamless communication between managers and investors."
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card rounded-2xl p-8 text-left relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Trust Section */}
        <section className="py-20 border-t border-white/5 bg-slate-900/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Trusted by Leading Investors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              {['Apex Capital', 'Summit Group', 'Horizon Ventures', 'Yield Partners'].map((name) => (
                <div key={name} className="flex items-center justify-center font-display font-bold text-2xl text-white">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2024 Apex Wealth Management. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
