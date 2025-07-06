import { apiClient } from '@/lib/api-client';
import { type SubscriptionStatus, type CreateSubscriptionDto, type StatusLimits } from '@/types/api';

class SubscriptionService {
  public async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!apiClient.isAuthenticated()) {
      // Return free plan for unauthenticated users
      return {
        status: 'inactive',
        plan: 'free'
      };
    }

    try {
      return await apiClient.get<SubscriptionStatus>('/subscription/status');
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      // Default to free plan on error
      return {
        status: 'inactive',
        plan: 'free'
      };
    }
  }

  public async getStatusLimits(): Promise<StatusLimits> {
    if (!apiClient.isAuthenticated()) {
      // Return default limits for unauthenticated users
      return {
        count: 0,
        canCreate: true,
        limit: 3,
        message: "Default limits for local users"
      };
    }

    try {
      return await apiClient.get<StatusLimits>('/settings/status-limits');
    } catch (error) {
      console.error('Failed to get status limits:', error);
      // Default limits on error
      return {
        count: 0,
        canCreate: false,
        limit: 3,
        message: "Failed to fetch limits"
      };
    }
  }

  public async createSubscription(priceId: string): Promise<{ clientSecret: string, subscriptionId: string }> {
    const createDto: CreateSubscriptionDto = { priceId };
    return await apiClient.post<{ clientSecret: string, subscriptionId: string }>('/subscription', createDto);
  }

  public async cancelSubscription(): Promise<void> {
    await apiClient.delete('/subscription');
  }

  public async reactivateSubscription(): Promise<void> {
    await apiClient.post('/subscription/reactivate');
  }

  public isPremiumPlan(subscription: SubscriptionStatus): boolean {
    return subscription.plan === 'premium' && 
           ['active'].includes(subscription.status);
  }

  public canCreateCustomStatuses(limits: StatusLimits): boolean {
    return limits.canCreate;
  }
}

export const subscriptionService = new SubscriptionService();