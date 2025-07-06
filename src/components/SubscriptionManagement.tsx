import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Star, Clock, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function SubscriptionManagement() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    subscription, 
    isPremium, 
    cancelSubscription, 
    reactivateSubscription 
  } = useSubscription();

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      toast.success(t('subscription.cancelSuccess'));
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error(t('subscription.cancelError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      await reactivateSubscription();
      toast.success(t('subscription.reactivateSuccess'));
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      toast.error(t('subscription.reactivateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Star className="h-3 w-3 mr-1" />
            {t('subscription.active')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            {t('subscription.cancelled')}
          </Badge>
        );
      case 'past_due':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('subscription.pastDue')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('subscription.free')}
          </Badge>
        );
    }
  };

  const getStatusDescription = () => {
    switch (subscription.status) {
      case 'active':
        return t('subscription.activeDesc');
      case 'cancelled':
        return t('subscription.cancelledDesc');
      case 'past_due':
        return t('subscription.pastDueDesc');
      default:
        return t('subscription.freeDesc');
    }
  };

  if (!isPremium && subscription.status === 'inactive') {
    return null; // Don't show management for free users
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t('subscription.management')}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              {getStatusDescription()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{t('subscription.currentPlan')}</p>
            <p className="text-sm text-gray-600 capitalize">{subscription.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('subscription.status')}</p>
            <p className="font-medium capitalize">{subscription.status}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {subscription.status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  {t('subscription.cancel')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('subscription.confirmCancel')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('subscription.cancelWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('subscription.confirmCancelButton')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {subscription.status === 'cancelled' && (
            <Button 
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? t('common.loading') : t('subscription.reactivate')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}