import React from 'react';
import { HTMLSanitizer } from '@/utils/xssProtection';

interface SafeContentProps {
  content: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  allowHTML?: boolean;
}

/**
 * SafeContent component that automatically sanitizes user input
 * Prevents XSS attacks by escaping dangerous characters
 */
export default function SafeContent({ 
  content, 
  className = '', 
  as: Component = 'span',
  allowHTML = false 
}: SafeContentProps) {
  const sanitizedContent = allowHTML 
    ? HTMLSanitizer.escapeHTML(content)
    : HTMLSanitizer.sanitizeInput(content);

  return React.createElement(Component, {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedContent }
  });
}

/**
 * Safe text component that never allows HTML
 */
export function SafeText({ content, className = '', as: Component = 'span' }: Omit<SafeContentProps, 'allowHTML'>) {
  const sanitizedContent = HTMLSanitizer.escapeHTML(content);
  
  return React.createElement(Component, {
    className
  }, sanitizedContent);
}