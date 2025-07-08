import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft } from 'lucide-react'

function PaymentCancelled() {
  const { t } = useTranslation()

  const handleGoBack = () => {
    window.location.href = '/'
  }

  const handleTryAgain = () => {
    window.location.href = '/'
    // The user can try upgrading again from the main app
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {t('subscription.paymentCancelled')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {t('subscription.paymentCancelledMessage')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 {t('subscription.noChargesApplied')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('subscription.backToDashboard')}
            </Button>
            <Button 
              onClick={handleTryAgain}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {t('subscription.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/payment-cancelled')({
  component: PaymentCancelled,
})