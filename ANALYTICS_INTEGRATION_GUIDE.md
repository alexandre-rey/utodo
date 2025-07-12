# Google Analytics Integration Guide

## Overview
This document outlines the Google Analytics 4 (GA4) integration for µTodo, providing comprehensive user behavior tracking and insights.

## ✅ Implemented Analytics Features

### 1. Core Setup
- **Google Analytics 4**: Latest GA version with enhanced tracking
- **React GA4 Integration**: Seamless React component integration
- **Environment Configuration**: Configurable measurement ID and debug mode
- **Privacy Compliant**: Respects user privacy and GDPR requirements

### 2. Automated Tracking

#### Page Views
- Automatic page view tracking on route changes
- Custom page titles and paths
- Language-specific tracking

#### Performance Metrics
- **Page Load Time**: Complete page loading duration
- **First Contentful Paint (FCP)**: Time to first visual content
- **Largest Contentful Paint (LCP)**: Core Web Vitals metric
- **User Device Information**: Screen resolution, viewport size

#### User Sessions
- Session start/end tracking
- Session duration measurement
- Device type classification (mobile/desktop)
- Browser language and timezone detection

### 3. Feature-Specific Tracking

#### Todo Management
```typescript
// Tracked events:
- todo_created: When users create new todos
- todo_updated: When users edit existing todos
- todo_deleted: When users delete todos
- todo_completed: When users mark todos as complete
- bulk_actions: When users perform bulk operations
```

#### Authentication
```typescript
// Tracked events:
- sign_in_success: Successful user login
- sign_up_success: Successful user registration
- auth_failed: Authentication failures
- auth_mode_switch: Switch between login/register
- user_logout: User logout events
```

#### App Usage
```typescript
// Tracked events:
- component_mount/unmount: Component lifecycle
- view_mode_changed: Kanban/calendar view switches
- search: Todo search operations
- settings_updated: Settings modifications
- feature_usage: Specific feature interactions
```

#### Performance & Errors
```typescript
// Tracked events:
- performance_metric: Load times and performance data
- error: Application errors and exceptions
- conversion: Key conversion events
```

### 4. User Properties
- **User Type**: Authenticated vs anonymous
- **Device Type**: Mobile vs desktop
- **Language**: Current app language
- **Premium Status**: Free vs premium user
- **Session Data**: Session duration and engagement

## 🔧 Configuration

### Environment Variables
```env
# Google Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Your GA4 Measurement ID
VITE_GA_DEBUG_MODE=false              # Enable debug mode for development
```

### CSP Updates
The Content Security Policy has been updated to allow Google Analytics:
```html
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com
connect-src 'self' https://www.google-analytics.com https://analytics.google.com
img-src 'self' data: https: https://www.google-analytics.com
```

## 📊 Analytics Dashboard Setup

### Key Metrics to Monitor

#### User Engagement
1. **Active Users**: Daily/weekly/monthly active users
2. **Session Duration**: Average time users spend in the app
3. **Page Views**: Most visited sections
4. **Bounce Rate**: Users leaving without interaction

#### Feature Usage
1. **Todo Operations**: Create, edit, delete, complete rates
2. **View Preferences**: Kanban vs calendar usage
3. **Search Usage**: Search frequency and success rates
4. **Authentication**: Sign-up vs sign-in rates

#### Performance
1. **Core Web Vitals**: LCP, FID, CLS scores
2. **Page Load Times**: Performance across different devices
3. **Error Rates**: Application error frequency
4. **Conversion Rates**: Key action completion

### Custom Events to Track

#### Business Metrics
- User retention rates
- Feature adoption
- Premium upgrade conversions
- User journey patterns

#### Technical Metrics
- Error rates by component
- Performance by device type
- API response times
- Browser compatibility

## 🎯 Usage Examples

### In Components
```typescript
import { useAnalytics, useComponentAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  // Automatic component tracking
  useComponentAnalytics('MyComponent', { additionalData: 'value' });
  
  const analytics = useAnalytics();
  
  const handleUserAction = () => {
    // Track specific user actions
    analytics.trackUsageAction('button_click', {
      feature: 'my_feature',
      location: 'header'
    });
  };
  
  return <button onClick={handleUserAction}>Click me</button>;
}
```

### Custom Event Tracking
```typescript
// Track todo operations
analytics.trackTodoAction('todo_created', {
  hasDueDate: true,
  status: 'pending',
  hasDescription: false
});

// Track authentication
analytics.trackAuthAction('sign_in_success', {
  method: 'email',
  userType: 'returning'
});

// Track errors
analytics.trackError('API_TIMEOUT', {
  endpoint: '/api/todos',
  duration: 5000
});
```

## 🔍 Debugging

### Debug Mode
Enable debug mode in development:
```env
VITE_GA_DEBUG_MODE=true
```

This will:
- Log all events to console
- Use GA4's test mode
- Provide detailed tracking information
- Not affect production data

### Verification
1. Check browser console for debug logs
2. Use Google Analytics Real-Time reports
3. Verify events in GA4 DebugView
4. Test with GA4 Measurement Protocol

## 🔒 Privacy & Compliance

### Data Collection
- No personally identifiable information (PII) collected
- User IDs are hashed/anonymized
- IP addresses anonymized in GA4
- Respects Do Not Track headers

### GDPR Compliance
- Cookie consent integration ready
- Data retention policies configurable
- User data deletion capabilities
- Transparent data usage

### User Controls
```typescript
// Users can opt-out of tracking
if (userOptedOut) {
  // Disable analytics initialization
  return;
}
```

## 📈 Reporting & Insights

### Automated Reports
Set up Google Analytics 4 to send automated reports for:
- Weekly user engagement summary
- Monthly feature usage analysis
- Performance monitoring alerts
- Error rate notifications

### Custom Dashboards
Create dashboards for:
- **Product Team**: Feature usage, user flows
- **Engineering**: Performance, errors, technical metrics
- **Business**: Conversions, retention, growth

### Data Export
- Connect to Google Analytics Data API
- Export to BigQuery for advanced analysis
- Integrate with business intelligence tools

## 🚀 Advanced Features

### Enhanced Ecommerce (Future)
Track premium subscriptions:
```typescript
analytics.trackSubscription('purchase', {
  type: 'premium_monthly',
  value: 9.99,
  currency: 'USD'
});
```

### Custom Dimensions
Set up custom dimensions for:
- User segment classification
- Feature flags tracking
- A/B test variations
- User journey stages

### Goal Configuration
Configure goals in GA4 for:
- Todo creation milestones
- User retention periods
- Feature adoption rates
- Premium conversions

## 📋 Implementation Checklist

### Initial Setup
- [ ] Set up Google Analytics 4 property
- [ ] Configure measurement ID in environment
- [ ] Update CSP headers for GA4 domains
- [ ] Test basic page view tracking
- [ ] Verify real-time data in GA4

### Event Tracking
- [ ] Implement todo operation tracking
- [ ] Add authentication event tracking
- [ ] Set up error and performance tracking
- [ ] Configure user property tracking
- [ ] Test custom events in debug mode

### Analytics Dashboard
- [ ] Create custom dashboards
- [ ] Set up automated reports
- [ ] Configure alerts for key metrics
- [ ] Document insights and KPIs
- [ ] Train team on analytics interpretation

---

**Last Updated**: July 2025  
**Analytics Status**: ✅ Fully Implemented  
**GA4 Property**: [Your GA4 Property ID]  
**Next Review**: August 2025
