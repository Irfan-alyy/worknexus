/**
 * Rate limiter configuration
 * Define rate limits per endpoint or category
 */

const DEFAULT_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 200, // requests per window
}

const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per 15 minutes
}

const GENERAL_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
}

const CHAT_RATE_LIMIT = {
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // 20 messages per 10 seconds
}

/**
 * Get rate limit configuration based on endpoint
 * @param {string} endpoint - Route path
 * @returns {Object} Rate limit config { windowMs, max }
 */
function getRateLimitConfig(endpoint) {
  if (endpoint.includes("/auth/")) {
    return AUTH_RATE_LIMIT
  }

  if (endpoint.includes("/chat/")) {
    return CHAT_RATE_LIMIT
  }

  return GENERAL_RATE_LIMIT
}

module.exports = {
  DEFAULT_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  GENERAL_RATE_LIMIT,
  CHAT_RATE_LIMIT,
  getRateLimitConfig,
}
