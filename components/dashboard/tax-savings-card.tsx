import { TaxSavingsOpportunity } from '@/types/property-tax'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ArrowRight, DollarSign, CheckCircle2 } from 'lucide-react'

interface TaxSavingsCardProps {
    opportunity: TaxSavingsOpportunity | null
    onStartAppeal?: () => void
}

export function TaxSavingsCard({ opportunity, onStartAppeal }: TaxSavingsCardProps) {
    if (!opportunity) {
        return (
            <Card className="glass-card border-none opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center text-lg font-display">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-400" />
                            Tax Assessment Analysis
                        </CardTitle>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 shadow-sm shadow-emerald-900/20">
                            Fairly Assessed
                        </span>
                    </div>
                    <CardDescription className="text-slate-400">
                        Last checked: {new Date().toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                        We analyzed your property tax assessment properly and found no significant over-assessment compared to local properties. We will check again next cycle.
                    </p>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-md shadow-2xl shadow-amber-900/20 border border-amber-500/20">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"></div>

            <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <CardTitle className="text-amber-100 font-display text-xl">Tax Savings Opportunity</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg text-white font-display">{opportunity.propertyName}</h3>
                        <p className="text-sm text-slate-300 mt-1">
                            Potential annual savings found based on <span className="text-white font-medium">{opportunity.comparables.length} local comparables</span>.
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                        <div>
                            <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold">Potential Savings</p>
                            <p className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                                {formatCurrency(opportunity.potentialSavings)}
                                <span className="text-sm font-normal text-slate-400 ml-1">/year</span>
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <DollarSign className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                        <div>
                            <p className="text-slate-400 text-xs mb-1">Current Tax</p>
                            <p className="font-mono font-medium text-white">{formatCurrency(opportunity.currentAnnualTax)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs mb-1">Fair Market Tax</p>
                            <p className="font-mono font-medium text-white">{formatCurrency(opportunity.averageCompTax)}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/25 border border-amber-400/20 h-12 text-base transition-all duration-300 hover:scale-[1.02]"
                            onClick={onStartAppeal}
                        >
                            Start Appeal Process
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="text-xs text-center text-amber-400/60 mt-3 font-medium">
                            {opportunity.recommendedAction}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
