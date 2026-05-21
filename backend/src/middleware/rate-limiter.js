const logger = require("../config/logger.config")
const { errorResponse } = require("../utils/response")

/**
 * In-memory rate limiter middleware
 * Tracks requests by IP address
 */

const requestBuckets = new Map()

// Clean up old buckets periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  let cleaned = 0
  for (const [key, bucket] of requestBuckets.entries()) {
    if (now > bucket.resetAt + 60000) {
      // Remove buckets that expired more than 1 minute ago
      requestBuckets.delete(key)
      cleaned++
    }
  }
  if (cleaned > 0) {
    logger.debug(`Cleaned up ${cleaned} expired rate limit buckets`)
  }
}, 10 * 60 * 1000)

/**
 * Rate limiter middleware
 * @param {Object} options - Configuration options
 * @param {number} [options.limit=100] - Max requests per window
 * @param {number} [options.windowMs=60000] - Time window in milliseconds
 * @returns {Function} Express middleware
 */
function rateLimiter({ limit = 100, windowMs = 60_000 } = {}) {
  return (req, res, next) => {
    // Get client IP
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown"
    const now = Date.now()

    // Get or create bucket for this IP
    let bucket = requestBuckets.get(key)
    if (!bucket) {
      bucket = { count: 0, resetAt: now + windowMs }
      requestBuckets.set(key, bucket)
    }

    // Reset bucket if window expired
    if (now > bucket.resetAt) {
      bucket.count = 0
      bucket.resetAt = now + windowMs
    }

    // Increment counter
    bucket.count += 1

    // Add rate limit headers
    res.set("X-RateLimit-Limit", limit)
    res.set("X-RateLimit-Remaining", Math.max(0, limit - bucket.count))
    res.set("X-RateLimit-Reset", bucket.resetAt)

    // Check if limit exceeded
    if (bucket.count > limit) {
      logger.warn(`Rate limit exceeded for IP: ${key}`, {
        ip: key,
        requests: bucket.count,
        limit,
      })

      const { response, statusCode } = errorResponse(
        "Too many requests. Please try again later.",
        429
      )
      return res.status(statusCode).json(response)
    }

    return next()
  }
}

module.exports = rateLimiter