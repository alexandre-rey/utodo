import DOMPurify from 'dompurify';

// Configuration for DOMPurify
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [], // No HTML tags allowed - plain text only
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true, // Keep text content even if tags are removed
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for display and storage
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  
  // First pass: Remove all HTML tags and keep only text content
  const cleaned = DOMPurify.sanitize(input, SANITIZE_CONFIG);
  
  // Second pass: Additional validation and cleanup
  return cleaned
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 1000); // Limit length to prevent DoS attacks
}

/**
 * Sanitizes email input specifically
 * @param email - The email string to sanitize
 * @returns Sanitized email string
 */
export function sanitizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  
  const cleaned = sanitizeInput(email);
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  
  return cleaned.toLowerCase();
}

/**
 * Validates and sanitizes password input
 * @param password - The password string to validate
 * @returns Sanitized password string
 */
export function validatePassword(password: string | undefined | null): string {
  if (!password) {
    throw new Error('Password is required');
  }
  
  // Don't sanitize passwords - just validate
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    throw new Error('Password must be less than 128 characters');
  }
  
  // Check for basic complexity requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (complexityCount < 3) {
    throw new Error('Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, or special characters');
  }
  
  return password;
}

/**
 * Sanitizes todo content (title and description)
 * @param content - The content to sanitize
 * @returns Sanitized content
 */
export function sanitizeTodoContent(content: string | undefined | null): string {
  const sanitized = sanitizeInput(content);
  
  // Additional validation for todo content
  if (sanitized.length > 500) {
    throw new Error('Content must be less than 500 characters');
  }
  
  return sanitized;
}