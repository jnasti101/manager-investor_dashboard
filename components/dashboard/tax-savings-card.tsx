import { TaxSavingsOpportunity } from '@/types/property-tax'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ArrowRight, DollarSign } from 'lucide-react'

interface TaxSavingsCardProps {
    opportunity: TaxSavingsOpportunity
}

export function TaxSavingsCard({ opportunity }: TaxSavingsCardProps) {
    return (
        <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-green-800">Tax Savings Opportunity</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">{opportunity.propertyName}</h3>
                        <p className="text-sm text-gray-600">
                            Potential annual savings found based on {opportunity.comparables.length} local comparables.
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Potential Savings</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(opportunity.potentialSavings)}
                                <span className="text-sm font-normal text-gray-500">/year</span>
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Current Tax</p>
                            <p className="font-medium text-gray-900">{formatCurrency(opportunity.currentAnnualTax)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Fair Market Tax</p>
                            <p className="font-medium text-gray-900">{formatCurrency(opportunity.averageCompTax)}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Start Appeal Process
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-xs text-center text-green-700 mt-2">
                            {opportunity.recommendedAction}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
