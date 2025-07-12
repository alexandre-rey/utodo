/**
 * Analytics Test Component
 * Use this component to test Google Analytics integration
 * Remove or disable in production
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAnalytics } from '../hooks/useAnalytics';
import { GoogleAnalyticsService } from '../services/analytics.service';

interface AnalyticsTestProps {
  isVisible?: boolean;
}

export default function AnalyticsTest({ isVisible = false }: AnalyticsTestProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const analytics = useAnalytics();

  // Only show in development or when explicitly enabled
  if (!isVisible && import.meta.env.VITE_ENV === 'production') {
    return null;
  }

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = () => {
    setTestResults([]);
    addResult('Starting analytics tests...');

    // Test 1: Check if analytics is initialized
    if (GoogleAnalyticsService.isEnabled()) {
      addResult('✅ Analytics is initialized');
      addResult(`📊 Measurement ID: ${GoogleAnalyticsService.getMeasurementId()}`);
    } else {
      addResult('❌ Analytics is not initialized');
      return;
    }

    // Test 2: Track page view
    try {
      GoogleAnalyticsService.trackPageView({
        page_title: 'Analytics Test Page',
        page_path: '/analytics-test'
      });
      addResult('✅ Page view tracked');
    } catch (error) {
      addResult('❌ Page view tracking failed');
    }

    // Test 3: Track custom event
    try {
      analytics.trackUsageAction('analytics_test', {
        test_type: 'manual_test',
        timestamp: Date.now()
      });
      addResult('✅ Custom event tracked');
    } catch (error) {
      addResult('❌ Custom event tracking failed');
    }

    // Test 4: Track todo event
    try {
      analytics.trackTodoAction('test_todo_created', {
        todoId: 'test-123',
        status: 'pending',
        hasDueDate: true
      });
      addResult('✅ Todo event tracked');
    } catch (error) {
      addResult('❌ Todo event tracking failed');
    }

    // Test 5: Track error
    try {
      analytics.trackError('Test error for analytics', {
        test_error: true,
        severity: 'low'
      });
      addResult('✅ Error event tracked');
    } catch (error) {
      addResult('❌ Error event tracking failed');
    }

    // Test 6: Set user properties
    try {
      analytics.setUserProperties({
        test_user: true,
        device_type: 'test_device'
      });
      addResult('✅ User properties set');
    } catch (error) {
      addResult('❌ User properties failed');
    }

    addResult('🎉 Analytics tests completed!');
    addResult('💡 Check your browser console and GA4 Real-Time reports');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          🔬 Analytics Test Panel
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTestResults([])}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            size="sm" 
            className="flex-1"
          >
            Run Tests
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline" 
            size="sm"
          >
            Clear
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-600">Test Results:</h4>
            <div className="bg-gray-50 rounded p-2 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Status:</strong> {GoogleAnalyticsService.isEnabled() ? '🟢 Active' : '🔴 Inactive'}</p>
          <p><strong>ID:</strong> {GoogleAnalyticsService.getMeasurementId() || 'Not set'}</p>
          <p><strong>Debug:</strong> {import.meta.env.VITE_GA_DEBUG_MODE === 'true' ? '🟡 On' : '⚪ Off'}</p>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>💡 Open browser console to see debug logs</p>
          <p>📊 Check GA4 Real-Time reports for data</p>
        </div>
      </CardContent>
    </Card>
  );
}
