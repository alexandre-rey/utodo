import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string) => Promise<void>;
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

  // This would typically come from your Stripe configuration
  const PREMIUM_PRICE_ID = 'price_premium_monthly'; // Replace with actual Stripe price ID

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade(PREMIUM_PRICE_ID);
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error(t('subscription.upgradeFailed'), {
        description: t('subscription.upgradeFailedDesc')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    t('subscription.feature.unlimitedStatuses'),
    t('subscription.feature.prioritySupport'),
    t('subscription.feature.advancedFeatures'),
    t('subscription.feature.dataBackup')
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
              $9.99<span className="text-sm font-normal">/{t('subscription.month')}</span>
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
          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? t('subscription.processing') : t('subscription.upgradeNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}