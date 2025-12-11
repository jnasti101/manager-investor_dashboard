'use client'

import { useState } from 'react'
import { TaxSavingsOpportunity } from '@/types/property-tax'
import { TaxSavingsCard } from './tax-savings-card'
import { TaxAppealWizard } from './tax-appeal-wizard'

interface TaxAppealSectionProps {
    propertyId: string
    opportunity: TaxSavingsOpportunity | null
}

export function TaxAppealSection({ propertyId, opportunity }: TaxAppealSectionProps) {
    const [showWizard, setShowWizard] = useState(false)
    const [isComplete, setIsComplete] = useState(false)

    if (isComplete) return null

    return (
        <>
            <TaxSavingsCard
                opportunity={opportunity}
                onStartAppeal={() => setShowWizard(true)}
            />
            {showWizard && opportunity && (
                <TaxAppealWizard
                    propertyId={propertyId}
                    opportunity={opportunity}
                    onComplete={() => {
                        setShowWizard(false)
                        setIsComplete(true)
                    }}
                />
            )}
        </>
    )
}
