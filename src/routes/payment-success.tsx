import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star } from 'lucide-react'

function PaymentSuccess() {
  const { t } = useTranslation()
  const searchParams = new URLSearchParams(window.location.search)
  const session_id = searchParams.get('session_id')

  useEffect(() => {
    // Show success toast
    toast.success(t('subscription.paymentSuccess'), {
      description: t('subscription.upgradeSuccess')
    })

    // You could verify the payment with your backend here using session_id
    console.log('Payment successful, session_id:', session_id)
  }, [session_id, t])

  const handleContinue = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            {t('subscription.upgradeSuccess')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {t('subscription.paymentSuccessMessage')}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              🎉 {t('subscription.welcomeToPremium')}
            </p>
          </div>
          <Button 
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {t('subscription.continueToDashboard')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/payment-success')({
  component: PaymentSuccess,
})