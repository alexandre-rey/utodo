import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string) => Promise<{ clientSecret: string; subscriptionId: string; stripe: Stripe | null }>;
  currentLimit: number;
  currentUsage: number;
}

export default function UpgradeDialog({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  currentLimit, 
  currentUsage 
}: UpgradeDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string; stripe: Stripe | null } | null>(null);

  // This would typically come from your Stripe configuration
  const PREMIUM_PRICE_ID = 'prod_Sciw3hP4PkkysL'; // Replace with actual Stripe price ID

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const result = await onUpgrade(PREMIUM_PRICE_ID);
      
      if (!result.clientSecret) {
        throw new Error('No client secret returned from server');
      }
      
      if (!result.stripe) {
        throw new Error('Stripe failed to load');
      }
      
      setPaymentData({ clientSecret: result.clientSecret, stripe: result.stripe });
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error(t('subscription.upgradeFailed'), {
        description: error instanceof Error ? error.message : t('subscription.upgradeFailedDesc')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setPaymentData(null);
    onClose();
    toast.success(t('subscription.upgradeSuccess'));
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setPaymentData(null);
  };

  const handleDialogClose = () => {
    setShowPaymentForm(false);
    setPaymentData(null);
    onClose();
  };

  const features = [
    t('subscription.feature.unlimitedStatuses'),
    t('subscription.feature.prioritySupport'),
    //t('subscription.feature.advancedFeatures'),
    //t('subscription.feature.dataBackup')
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        {showPaymentForm && paymentData && paymentData.stripe && paymentData.clientSecret ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('subscription.completePayment')}</DialogTitle>
            </DialogHeader>
            <Elements 
              stripe={paymentData.stripe}
              options={{
                clientSecret: paymentData.clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </>
        ) : showPaymentForm ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('subscription.completePayment')}</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <p>Loading payment form...</p>
              <p className="text-sm text-gray-500 mt-2">
                Stripe: {paymentData?.stripe ? '✓' : '✗'} | 
                ClientSecret: {paymentData?.clientSecret ? '✓' : '✗'}
              </p>
              <Button onClick={handlePaymentCancel} className="mt-4">
                {t('actions.cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t('subscription.upgradeToPremium')}
              </DialogTitle>
              <DialogDescription>
                {t('subscription.statusLimitReached', { 
                  current: currentUsage, 
                  limit: currentLimit 
                })}
              </DialogDescription>
            </DialogHeader>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {t('subscription.premiumPlan')}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-yellow-700">
                  1.99€ <span className="text-sm font-normal">/{t('subscription.month')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleDialogClose} className="flex-1">
                {t('actions.cancel')}
              </Button>
              <Button 
                onClick={handleUpgrade} 
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 flex-1"
              >
                {isLoading ? t('subscription.processing') : t('subscription.upgradeNow')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}