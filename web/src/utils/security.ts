import CryptoJS from 'crypto-js';

// Encryption key management
const getEncryptionKey = (): string => {
  const appSecret = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key';
  return appSecret;
};

// Data encryption
export const encryptData = <T>(data: T): string => {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, getEncryptionKey()).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Data decryption
export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim(); // Remove leading/trailing whitespace
};

// Object sanitization with proper type safety
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  (Object.entries(sanitized) as [keyof T, unknown][]).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as T[keyof T];
    }
  });
  return sanitized;
};

// Rate limiting for authentication attempts
const rateLimitStore = new Map<string, number[]>();
const MAX_ATTEMPTS = 5;
const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

export const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const attempts = rateLimitStore.get(userId) || [];
  
  // Remove attempts outside the time window
  const recentAttempts = attempts.filter(time => now - time < TIME_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false; // Rate limit exceeded
  }
  
  // Add new attempt
  recentAttempts.push(now);
  rateLimitStore.set(userId, recentAttempts);
  return true;
};

// Error handling with proper type definitions
interface FirebaseAuthError {
  code?: string;
  message?: string;
}

export const handleError = (error: FirebaseAuthError | Error | unknown): string => {
  console.error('Internal error:', error); // Log full error for debugging
  
  if (typeof error === 'object' && error !== null) {
    const authError = error as FirebaseAuthError;
    if (authError.code === 'auth/wrong-password' || authError.code === 'auth/user-not-found') {
      return 'Invalid credentials';
    }
    if (authError.code === 'auth/too-many-requests') {
      return 'Too many attempts. Please try again later';
    }
  }
  return 'An error occurred. Please try again';
};

// Secure data deletion
export const secureDelete = (storageKey: string): void => {
  try {
    // Overwrite data before deletion
    localStorage.setItem(storageKey, JSON.stringify({ deleted: true }));
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Secure deletion error:', error);
    throw new Error('Failed to securely delete data');
  }
};

// CSRF token management with type safety
let csrfToken = '';

export const generateCsrfToken = (): string => {
  csrfToken = CryptoJS.lib.WordArray.random(16).toString();
  return csrfToken;
};

export const validateCsrfToken = (token: string): boolean => {
  return token === csrfToken && token !== '';
};