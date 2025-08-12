import { NextFunction, Request, Response } from 'express';

// Content Security Policy configuration
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com", "*.firebaseapp.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com"],
    imgSrc: ["'self'", "data:", "*.googleusercontent.com"],
    connectSrc: ["'self'", "*.firebaseio.com", "*.googleapis.com"],
    fontSrc: ["'self'", "fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    frameSrc: ["'none'"],
  }
};

// Security middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    Object.entries(cspConfig.directives)
      .map(([key, value]) => `${key} ${value.join(' ')}`)
      .join('; ')
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // HSTS (uncomment in production with proper SSL)
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  next();
};

// Rate limiting configuration
const rateLimits = new Map<string, number[]>();
const MAX_REQUESTS = 100;
const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const requests = rateLimits.get(ip) || [];

  // Remove old requests outside the time window
  const recentRequests = requests.filter(time => now - time < TIME_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  recentRequests.push(now);
  rateLimits.set(ip, recentRequests);
  next();
};

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
  resave: false,
  saveUninitialized: false,
};

// Input validation middleware
export const validateInput = (input: string): boolean => {
  // Remove potentially dangerous characters
  const sanitized = input.replace(/[<>]/g, '').trim();
  return input === sanitized;
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Internal error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message;
    
  res.status(500).json({ error: message });
};