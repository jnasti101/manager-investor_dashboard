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
            <Card className="glass-card">
                <CardHeader className="pb-2 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground flex items-center text-lg">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                            Tax Assessment Analysis
                        </CardTitle>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                            Fairly Assessed
                        </span>
                    </div>
                    <CardDescription className="text-muted-foreground">
                        Last checked: {new Date().toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                        We analyzed your property tax assessment properly and found no significant over-assessment compared to local properties. We will check again next cycle.
                    </p>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card className="glass-card border-blue-500/30">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-foreground text-xl">Tax Savings Opportunity</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-5">
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">{opportunity.propertyName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Potential annual savings found based on <span className="text-foreground">{opportunity.comparables.length} local comparables</span>.
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-secondary/50 p-4 rounded-lg border border-border">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Potential Savings</p>
                            <p className="text-3xl font-semibold text-foreground mt-1">
                                {formatCurrency(opportunity.potentialSavings)}
                                <span className="text-sm font-normal text-muted-foreground ml-1">/year</span>
                            </p>
                        </div>
                        <div className="h-11 w-11 bg-primary rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-3 rounded-lg border border-border">
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Current Tax</p>
                            <p className="font-mono font-medium text-foreground">{formatCurrency(opportunity.currentAnnualTax)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Fair Market Tax</p>
                            <p className="font-mono font-medium text-foreground">{formatCurrency(opportunity.averageCompTax)}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 transition-colors"
                            onClick={onStartAppeal}
                        >
                            Start Appeal Process
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-3">
                            {opportunity.recommendedAction}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
