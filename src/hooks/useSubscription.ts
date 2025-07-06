import { useState, useEffect } from 'react';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/contexts/AuthContext';
import { type SubscriptionStatus, type StatusLimits } from '@/types/api';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

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

  const loadSubscriptionData = async () => {
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
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [isAuthenticated, authLoading]); // loadSubscriptionData is recreated each render, no need to include it

  const isPremium = subscriptionService.isPremiumPlan(subscription);
  const canCreateMoreStatuses = subscriptionService.canCreateCustomStatuses(statusLimits);

  const createSubscription = async (priceId: string) => {
    try {
      const response = await subscriptionService.createSubscription(priceId);
      const { clientSecret, subscriptionId } = response;
      
      if (!clientSecret) {
        throw new Error('Backend did not return clientSecret');
      }
      
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '') as Stripe | null;
      
      if (!stripe) {
        throw new Error('Failed to load Stripe - check your publishable key');
      }
      
      return {
        clientSecret,
        subscriptionId,
        stripe
      };
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