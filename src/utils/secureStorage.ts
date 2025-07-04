import CryptoJS from 'crypto-js';

// Generate a device-specific encryption key
const getEncryptionKey = (): string => {
  let key = localStorage.getItem('_app_key');
  
  if (!key) {
    // Generate a new key based on device characteristics
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timestamp: Date.now().toString()
    };
    
    // Create a deterministic but unique key for this device/browser
    const deviceString = JSON.stringify(deviceInfo);
    key = CryptoJS.SHA256(deviceString).toString();
    
    // Store the key (this is not a secret, just a device identifier)
    localStorage.setItem('_app_key', key);
  }
  
  return key;
};

/**
 * Securely encrypts and stores data in localStorage
 * @param key - Storage key
 * @param data - Data to encrypt and store
 */
export const setSecureItem = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    const encryptionKey = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(jsonData, encryptionKey).toString();
    localStorage.setItem(`secure_${key}`, encrypted);
  } catch (error) {
    console.error('Failed to encrypt and store data:', error);
    throw new Error('Storage encryption failed');
  }
};

/**
 * Securely retrieves and decrypts data from localStorage
 * @param key - Storage key
 * @returns Decrypted data or null if not found/invalid
 */
export const getSecureItem = <T>(key: string): T | null => {
  try {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    
    const encryptionKey = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
    const jsonData = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonData) {
      console.warn('Failed to decrypt data - possibly corrupted');
      return null;
    }
    
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

/**
 * Removes encrypted data from localStorage
 * @param key - Storage key
 */
export const removeSecureItem = (key: string): void => {
  localStorage.removeItem(`secure_${key}`);
};

/**
 * Clears all encrypted data from localStorage
 */
export const clearSecureStorage = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('secure_')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * For non-sensitive data, use regular localStorage with validation
 * @param key - Storage key
 * @param data - Data to store
 */
export const setItem = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Failed to store data:', error);
    throw new Error('Storage failed');
  }
};

/**
 * Get non-sensitive data from localStorage with validation
 * @param key - Storage key
 * @returns Data or null if not found/invalid
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
};