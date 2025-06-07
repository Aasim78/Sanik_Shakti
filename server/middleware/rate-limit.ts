import rateLimit from 'express-rate-limit';

// Generic API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed attempts per hour
  message: 'Too many failed attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for Aadhaar verification
export const aadhaarLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 verification attempts per day
  message: 'Daily verification limit reached. Please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for SOS alerts
export const sosLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 SOS alerts per 5 minutes
  message: 'Too many SOS alerts. Please wait before sending another.',
  standardHeaders: true,
  legacyHeaders: false,
}); 