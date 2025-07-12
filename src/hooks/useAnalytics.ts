import { useEffect, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { GoogleAnalyticsService } from '../services/analytics.service';

/**
 * Custom hook for Google Analytics integration
 */
export function useAnalytics() {
  const router = useRouter();
  const { i18n } = useTranslation();

  // Track page views when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = router.state.location.pathname;
      const currentTitle = document.title;
      
      GoogleAnalyticsService.trackPageView({
        page_path: currentPath,
        page_title: currentTitle,
        page_location: window.location.href
      });

      // Track language usage
      GoogleAnalyticsService.trackUsageEvent('page_view', {
        language: i18n.language,
        page_path: currentPath
      });
    };

    // Initial page view
    handleRouteChange();

    // Note: TanStack Router doesn't have a direct route change listener
    // We'll track page views manually in components or use a different approach
  }, [router.state.location.pathname, i18n.language]);

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const trackPerformanceMetrics = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Track page load time
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          if (loadTime > 0) {
            GoogleAnalyticsService.trackPerformance('page_load_time', loadTime);
          }

          // Track First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            GoogleAnalyticsService.trackPerformance('first_contentful_paint', fcpEntry.startTime);
          }

          // Track Largest Contentful Paint
          if ('LargestContentfulPaint' in window) {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              GoogleAnalyticsService.trackPerformance('largest_contentful_paint', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
          }
        }
      };

      // Track metrics after page load
      if (document.readyState === 'complete') {
        setTimeout(trackPerformanceMetrics, 1000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(trackPerformanceMetrics, 1000);
        });
      }
    }
  }, []);

  // Analytics event tracking functions
  const trackTodoAction = useCallback((action: string, todoData?: any) => {
    GoogleAnalyticsService.trackTodoEvent(action, {
      todoId: todoData?.id,
      status: todoData?.status,
      hasDueDate: !!todoData?.dueDate,
      hasDescription: !!todoData?.description,
      count: todoData?.count
    });
  }, []);

  const trackAuthAction = useCallback((action: string, authData?: any) => {
    GoogleAnalyticsService.trackAuthEvent(action, {
      method: authData?.method || 'email',
      userType: authData?.userType || 'free'
    });
  }, []);

  const trackUsageAction = useCallback((action: string, usageData?: any) => {
    GoogleAnalyticsService.trackUsageEvent(action, {
      feature: usageData?.feature,
      viewMode: usageData?.viewMode,
      language: i18n.language,
      ...usageData
    });
  }, [i18n.language]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    GoogleAnalyticsService.trackSearchEvent(query, resultsCount);
  }, []);

  const trackError = useCallback((error: string, errorData?: any) => {
    GoogleAnalyticsService.trackError(error, errorData);
  }, []);

  const trackSubscription = useCallback((action: string, subscriptionData?: any) => {
    GoogleAnalyticsService.trackSubscriptionEvent(action, subscriptionData);
  }, []);

  const trackConversion = useCallback((type: string, value?: number) => {
    GoogleAnalyticsService.trackConversion(type, value);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    GoogleAnalyticsService.setUserProperties(properties);
  }, []);

  const setUserId = useCallback((userId: string) => {
    GoogleAnalyticsService.setUserId(userId);
  }, []);

  return {
    // Event tracking functions
    trackTodoAction,
    trackAuthAction,
    trackUsageAction,
    trackSearch,
    trackError,
    trackSubscription,
    trackConversion,
    
    // User tracking
    setUserProperties,
    setUserId,
    
    // Utility functions
    isAnalyticsEnabled: GoogleAnalyticsService.isEnabled(),
    measurementId: GoogleAnalyticsService.getMeasurementId()
  };
}

/**
 * Hook for tracking component mount/unmount
 */
export function useComponentAnalytics(componentName: string, additionalData?: Record<string, any>) {
  const { trackUsageAction } = useAnalytics();

  useEffect(() => {
    // Track component mount
    trackUsageAction('component_mount', {
      component: componentName,
      ...additionalData
    });

    // Track component unmount
    return () => {
      trackUsageAction('component_unmount', {
        component: componentName,
        ...additionalData
      });
    };
  }, [componentName, trackUsageAction, additionalData]);
}

/**
 * Hook for tracking user sessions
 */
export function useSessionAnalytics() {
  const { trackUsageAction, setUserProperties } = useAnalytics();

  useEffect(() => {
    const sessionStart = Date.now();
    
    // Track session start
    trackUsageAction('session_start', {
      timestamp: sessionStart,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });

    // Set user properties
    setUserProperties({
      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
      browser_language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Track session duration on page unload
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStart;
      trackUsageAction('session_end', {
        session_duration: sessionDuration,
        session_duration_minutes: Math.round(sessionDuration / (1000 * 60))
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track session end on component unmount
      const sessionDuration = Date.now() - sessionStart;
      trackUsageAction('session_end', {
        session_duration: sessionDuration,
        session_duration_minutes: Math.round(sessionDuration / (1000 * 60))
      });
    };
  }, [trackUsageAction, setUserProperties]);
}
