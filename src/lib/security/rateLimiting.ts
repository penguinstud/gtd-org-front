/**
 * Rate limiting middleware for API endpoint protection
 * Implements in-memory rate limiting with configurable limits
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../utils/logger'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  message: string       // Error message when limit exceeded
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {}

// Default rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,          // 100 requests per window
    message: 'Too many requests, please try again later.'
  },
  fileRead: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 30,           // 30 file reads per minute
    message: 'Too many file read requests, please slow down.'
  },
  fileList: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 20,           // 20 file list requests per minute
    message: 'Too many file list requests, please slow down.'
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextApiRequest): string {
  // In production, consider using more sophisticated client identification
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
  return ip.toString()
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime <= now) {
      delete rateLimitStore[key]
    }
  }
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(req: NextApiRequest, res: NextApiResponse, next?: () => void): boolean {
    const clientId = getClientIdentifier(req)
    const key = `${clientId}:${config.windowMs}:${config.maxRequests}`
    const now = Date.now()
    
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup
      cleanupExpiredEntries()
    }

    // Get or create rate limit entry
    let entry = rateLimitStore[key]
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore[key] = entry
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000)
      
      if (res) {
        res.status(429).json({
          success: false,
          error: config.message,
          retryAfter: resetTimeSeconds
        })
      }
      
      return false // Rate limit exceeded
    }

    // Increment counter
    entry.count++

    // Add rate limit headers if response object available
    if (res) {
      res.setHeader('X-RateLimit-Limit', config.maxRequests)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count))
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000))
    }

    if (next) {
      next()
    }
    
    return true // Request allowed
  }
}

/**
 * Pre-configured rate limiters
 */
export const apiRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.api)
export const fileReadRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.fileRead)
export const fileListRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.fileList)

/**
 * Input validation utilities
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  // Remove potential XSS characters
  const sanitized = input
    .replace(/[<>\"']/g, '') // Remove potential HTML/script injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
  
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`)
  }
  
  return sanitized
}

/**
 * Validate request body structure
 */
export function validateRequestBody(body: unknown, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid object')
  }
  
  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

/**
 * Security middleware wrapper for API endpoints
 */
export function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  rateLimiter = apiRateLimit
) {
  return async function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Apply rate limiting
      if (!rateLimiter(req, res)) {
        return // Rate limit exceeded, response already sent
      }
      
      // Apply basic security headers (additional to Next.js config)
      res.setHeader('X-Powered-By', 'GTD-Org-Front')
      
      // Call the original handler
      await handler(req, res)
      
    } catch (error) {
      logger.error('Security middleware error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}