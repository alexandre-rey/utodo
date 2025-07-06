import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/contexts/AuthContext';
import { type SubscriptionStatus, type StatusLimits } from '@/types/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    status: 'inactive',
    plan: 'free'
  });
  const [statusLimits, setStatusLimits] = useState<StatusLimits>({
    count: 0,
    canCreate: true,
    limit: 3,
    message: "Loading..."
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loadSubscriptionData = useCallback(async () => {
    if (authLoading) return;
    
    setIsLoading(true);
    try {
      const [subscriptionData, limitsData] = await Promise.all([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.getStatusLimits()
      ]);
      
      setSubscription(subscriptionData);
      setStatusLimits(limitsData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    loadSubscriptionData();
  }, [isAuthenticated, authLoading, loadSubscriptionData]);

  const isPremium = subscriptionService.isPremiumPlan(subscription);
  const canCreateMoreStatuses = subscriptionService.canCreateCustomStatuses(statusLimits);

  const createSubscription = async (priceId: string, paymentMethodId?: string) => {
    try {
      const { clientSecret, subscriptionId } = await subscriptionService.createSubscription(priceId, paymentMethodId);
      
      if (paymentMethodId) {
        // Payment method provided, subscription should be created and confirmed
        console.log('Subscription created with payment method:', { subscriptionId });
        // Refresh subscription data to get updated status
        await loadSubscriptionData();
        return { success: true, subscriptionId };
      } else {
        // Return client secret for manual payment confirmation
        return { clientSecret, subscriptionId };
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await subscriptionService.cancelSubscription();
      await loadSubscriptionData(); // Refresh data
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  const reactivateSubscription = async () => {
    try {
      await subscriptionService.reactivateSubscription();
      await loadSubscriptionData(); // Refresh data
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  };

  const updateStatusLimitsOptimistically = (countChange: number) => {
    setStatusLimits(prev => ({
      ...prev,
      count: Math.max(0, prev.count + countChange),
      canCreate: prev.count + countChange < prev.limit
    }));
  };

  return {
    subscription,
    statusLimits,
    isLoading,
    isPremium,
    canCreateMoreStatuses,
    createSubscription,
    cancelSubscription,
    reactivateSubscription,
    refreshData: loadSubscriptionData,
    updateStatusLimitsOptimistically
  };
}