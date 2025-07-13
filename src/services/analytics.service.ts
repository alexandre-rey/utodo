/**
 * Google Analytics Service for µTodo
 * Handles GA4 tracking and events
 */

import ReactGA from 'react-ga4';

interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  custom_parameters?: Record<string, any>;
}

interface PageViewParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  user_id?: string;
}

export class GoogleAnalyticsService {
  private static isInitialized = false;
  private static measurementId: string | null = null;
  private static debugMode = false;

  /**
   * Initialize Google Analytics
   */
  static initialize(): void {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const debugMode = import.meta.env.VITE_GA_DEBUG_MODE === 'true';
    const environment = import.meta.env.VITE_ENV;

    // Temporary debug to verify correct ID
    console.log('🔍 GA Init Check:', {
      measurementId,
      expected: 'G-6WYY1F8EMK',
      match: measurementId === 'G-6WYY1F8EMK'
    });

    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.warn('Google Analytics: Measurement ID not configured');
      return;
    }

    // Don't initialize in development unless explicitly enabled
    if (environment === 'development' && !debugMode) {
      return;
    }

    try {
      ReactGA.initialize(measurementId, {
        testMode: environment === 'development',
        gtagOptions: {
          debug_mode: debugMode,
          send_page_view: false, // We'll handle page views manually
        }
      });

      this.isInitialized = true;
      this.measurementId = measurementId;
      this.debugMode = debugMode;

      // Set default parameters
      ReactGA.gtag('config', measurementId, {
        app_name: 'µTodo',
        app_version: '1.0.0',
        content_group1: 'Todo App',
        custom_map: {
          custom_parameter_1: 'user_type'
        }
      });

    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Track page views
   */
  static trackPageView(params?: PageViewParams): void {
    if (!this.isInitialized) return;

    const pageViewData = {
      page_title: params?.page_title || document.title,
      page_location: params?.page_location || window.location.href,
      page_path: params?.page_path || window.location.pathname,
      ...params
    };

    try {
      ReactGA.send({
        hitType: 'pageview',
        ...pageViewData
      });

      if (this.debugMode) {
        console.log('GA Page View:', pageViewData);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom events
   */
  static trackEvent(params: EventParams): void {
    if (!this.isInitialized) return;

    try {
      ReactGA.event(params.action, {
        event_category: params.category,
        event_label: params.label,
        value: params.value,
        non_interaction: params.nonInteraction,
        ...params.custom_parameters
      });

      if (this.debugMode) {
        console.log('GA Event:', params);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track todo-specific events
   */
  static trackTodoEvent(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'Todo Management',
      label: details?.todoId || undefined,
      value: details?.count || undefined,
      custom_parameters: {
        todo_status: details?.status,
        todo_priority: details?.priority,
        has_due_date: details?.hasDueDate || false,
        view_mode: details?.viewMode
      }
    });
  }

  /**
   * Track user authentication events
   */
  static trackAuthEvent(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'Authentication',
      custom_parameters: {
        auth_method: details?.method || 'email',
        user_type: details?.userType || 'free'
      }
    });
  }

  /**
   * Track app usage patterns
   */
  static trackUsageEvent(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'App Usage',
      custom_parameters: {
        feature_used: details?.feature,
        session_duration: details?.sessionDuration,
        todos_count: details?.todosCount,
        view_mode: details?.viewMode,
        language: details?.language
      }
    });
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(metric: string, value: number, details?: Record<string, any>): void {
    this.trackEvent({
      action: 'performance_metric',
      category: 'Performance',
      label: metric,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        page_path: window.location.pathname,
        ...details
      }
    });
  }

  /**
   * Track search and filtering
   */
  static trackSearchEvent(query: string, resultsCount: number): void {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_query: query,
        results_count: resultsCount,
        search_type: 'todo_search'
      }
    });
  }

  /**
   * Track errors
   */
  static trackError(error: string, details?: Record<string, any>): void {
    this.trackEvent({
      action: 'error',
      category: 'Errors',
      label: error,
      nonInteraction: true,
      custom_parameters: {
        error_message: error,
        error_page: window.location.pathname,
        ...details
      }
    });
  }

  /**
   * Set user properties
   */
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return;

    try {
      ReactGA.gtag('config', this.measurementId!, {
        custom_map: properties
      });

      if (this.debugMode) {
        console.log('GA User Properties:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Set user ID for cross-device tracking
   */
  static setUserId(userId: string): void {
    if (!this.isInitialized) return;

    try {
      ReactGA.gtag('config', this.measurementId!, {
        user_id: userId
      });

      if (this.debugMode) {
        console.log('GA User ID set:', userId);
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Track subscription events
   */
  static trackSubscriptionEvent(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'Subscription',
      custom_parameters: {
        subscription_type: details?.type || 'premium',
        payment_method: details?.paymentMethod,
        subscription_value: details?.value
      }
    });
  }

  /**
   * Track conversion events
   */
  static trackConversion(conversionType: string, value?: number): void {
    this.trackEvent({
      action: 'conversion',
      category: 'Conversions',
      label: conversionType,
      value,
      custom_parameters: {
        conversion_type: conversionType,
        conversion_value: value
      }
    });
  }

  /**
   * Check if analytics is enabled
   */
  static isEnabled(): boolean {
    return this.isInitialized;
  }

  /**
   * Get measurement ID
   */
  static getMeasurementId(): string | null {
    return this.measurementId;
  }
}
