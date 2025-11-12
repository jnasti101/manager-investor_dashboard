import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PropertyForm } from '@/components/properties/property-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function NewPropertyPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
