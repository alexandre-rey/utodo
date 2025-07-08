/**
 * Environment configuration utilities
 */

/**
 * Get the API URL from environment variables
 */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

/**
 * Get the current environment
 */
export const getEnvironment = (): string => {
  return import.meta.env.VITE_ENV || 'development';
};

/**
 * Check if premium features are enabled
 */
export const isPremiumFeaturesEnabled = (): boolean => {
  return import.meta.env.VITE_PREMIUM_FEATURES_ENABLED === 'true';
};

/**
 * Get Stripe publishable key
 */
export const getStripePublishableKey = (): string => {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
};