import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ onPaymentSuccess, onPaymentError, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
        toast.error(t('subscription.paymentFailed'), {
          description: error.message
        });
      } else {
        onPaymentSuccess();
        toast.success(t('subscription.paymentSuccess'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onPaymentError(errorMessage);
      toast.error(t('subscription.paymentFailed'), {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('subscription.completePayment')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('subscription.processing')}
                </>
              ) : (
                t('subscription.payNow')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}