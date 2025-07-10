import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from 'lucide-react';

// Initialize Stripe
//const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RhTQ1IMIipJaxZMBz2dlVyC5Fx75JRaqgk8ece6o3TQd5G8m1AIf2Ui2TRiVjp0uk4szgRPCk9zwnDfw3IF77jA00Z44lM1A6');

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string, paymentMethodId?: string) => Promise<void>;
  currentLimit: number;
  currentUsage: number;
}

// Payment Form Component
/*
function PaymentForm({ 
  onUpgrade, 
  priceId, 
  isLoading, 
  setIsLoading 
}: { 
  onUpgrade: (priceId: string, paymentMethodId?: string) => Promise<void>;
  priceId: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        console.error('Payment method creation failed:', error);
        toast.error(t('subscription.paymentFailed'), {
          description: error.message
        });
        return;
      }

      // Call the upgrade function with payment method
      await onUpgrade(priceId, paymentMethod.id);

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(t('subscription.upgradeFailed'), {
        description: t('subscription.upgradeFailedDesc')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4" />
          <span className="text-sm font-medium">{t('subscription.paymentDetails')}</span>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-yellow-600 hover:bg-yellow-700"
      >
        {isLoading ? t('subscription.processing') : t('subscription.upgradeNow')}
      </Button>
    </form>
  );
}
*/
export default function UpgradeDialog({ 
  isOpen, 
  onClose, 
   
  currentLimit, 
  currentUsage 
}: UpgradeDialogProps) {
  const { t } = useTranslation();
 // const [isLoading, setIsLoading] = useState(false);

  // This would typically come from your Stripe configuration
  //const PREMIUM_PRICE_ID = 'prod_Sciw3hP4PkkysL'; // Replace with actual Stripe price ID

  /*
  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade(PREMIUM_PRICE_ID);
      // The function will redirect to Stripe Checkout
      // No need to handle success here as user will be redirected
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error(t('subscription.upgradeFailed'), {
        description: error instanceof Error ? error.message : t('subscription.upgradeFailedDesc')
      });
    } finally {
      setIsLoading(false);
    }
  };
  */
  const features = [
    t('subscription.feature.unlimitedStatuses'),
    t('subscription.feature.prioritySupport'),
    //t('subscription.feature.advancedFeatures'),
    //t('subscription.feature.dataBackup')
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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



        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}