const { getEnvConfig } = require("./env.config")

/**
 * Authentication configuration
 * JWT and bcrypt settings
 */

const { jwtSecret } = getEnvConfig()

// Validate JWT secret is provided
if (!jwtSecret) {
  console.warn(
    "Warning: JWT_SECRET is not set in environment variables. Using default secret for development only."
  )
}

const JWT_CONFIG = {
  secret: jwtSecret || "your_default_secret_key_change_in_production",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d", // 7 days
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d", // 30 days
}

const BCRYPT_CONFIG = {
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
}

/**
 * Get JWT configuration
 * @returns {Object} JWT config object
 */
function getJWTConfig() {
  return JWT_CONFIG
}

/**
 * Get bcrypt configuration
 * @returns {Object} Bcrypt config object
 */
function getBcryptConfig() {
  return BCRYPT_CONFIG
}

module.exports = {
  JWT_CONFIG,
  BCRYPT_CONFIG,
  getJWTConfig,
  getBcryptConfig,
}
