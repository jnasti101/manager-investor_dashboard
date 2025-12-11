'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Check, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { TaxSavingsOpportunity, ComparableProperty } from '@/types/property-tax'

interface TaxAppealWizardProps {
    propertyId: string
    opportunity: TaxSavingsOpportunity
    onComplete: () => void
}

export function TaxAppealWizard({ propertyId, opportunity, onComplete }: TaxAppealWizardProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [targetValue, setTargetValue] = useState(opportunity.averageCompTax / 0.012) // Rough estimate
    const [selectedComps, setSelectedComps] = useState<string[]>(
        opportunity.comparables.map(c => c.id)
    )

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/properties/${propertyId}/tax-appeal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentAssessedValue: opportunity.currentAnnualTax / 0.012, // Backing out value from tax
                    targetAssessedValue: targetValue,
                    taxYear: new Date().getFullYear(),
                    selectedComps
                })
            })

            if (!response.ok) throw new Error('Failed to submit appeal')

            onComplete()
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    Start Appeal Process
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>File Property Tax Appeal</DialogTitle>
                    <DialogDescription>
                        Step {step} of 3: {step === 1 ? 'Review Assessment' : step === 2 ? 'Select Comparables' : 'Confirm & Submit'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-slate-300">We've analyzed your property tax assessment against local comparables.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                                    <p className="text-sm text-slate-400">Current Annual Tax</p>
                                    <p className="text-xl font-semibold text-white">{formatCurrency(opportunity.currentAnnualTax)}</p>
                                </div>
                                <div className="p-4 bg-slate-700 rounded-lg border border-green-600/50">
                                    <p className="text-sm text-green-400">Estimated Fair Tax</p>
                                    <p className="text-xl font-semibold text-green-400">{formatCurrency(opportunity.averageCompTax)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300">Target Assessed Value</label>
                                <Input
                                    type="number"
                                    value={Math.round(targetValue)}
                                    onChange={(e) => setTargetValue(Number(e.target.value))}
                                    className="bg-slate-700 border-slate-600 text-white mt-1"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    This is the value we will argue for in the appeal.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300">Select the comparables to include in your evidence package:</p>
                            {opportunity.comparables.map((comp) => (
                                <div key={comp.id} className="flex items-start space-x-3 p-3 border border-slate-600 rounded-lg bg-slate-700/50 hover:bg-slate-700">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={selectedComps.includes(comp.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedComps([...selectedComps, comp.id])
                                            else setSelectedComps(selectedComps.filter(id => id !== comp.id))
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-sm text-white">{comp.address}</p>
                                        <p className="text-xs text-slate-400">
                                            {comp.squareFeet} sqft • Built {comp.yearBuilt} • {formatCurrency(comp.annualPropertyTax)}/yr tax
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-400">Ready to Submit</h4>
                                    <p className="text-sm text-green-300 mt-1">
                                        We will generate the appeal forms and attach the {selectedComps.length} selected comparables as evidence.
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400">
                                By clicking submit, you authorize us to generate a draft appeal for your review.
                                No official filing will happen until your final approval.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Draft Appeal
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
