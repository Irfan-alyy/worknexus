const jwt = require("jsonwebtoken")
const { getEnvConfig } = require("../config/env.config")
const { errorResponse } = require("../utils/response")

/**
 * Authentication middleware
 * Extracts and validates JWT token from Authorization header or cookies
 */

const auth = (req, res, next) => {
  try {
    const { jwtSecret } = getEnvConfig()
    const authorization = req.headers.authorization || ""
    const cookieHeader = req.headers.cookie || ""

    // Extract token from Authorization header or cookies
    let token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : cookieHeader
          .split(";")
          .map((pair) => pair.trim())
          .find((pair) => pair.startsWith("token="))

    if (!token) {
      const { response, statusCode } = errorResponse("Unauthorized", 401)
      return res.status(statusCode).json(response)
    }

    // Remove 'token=' prefix if extracted from cookie
    if (token.startsWith("token=")) {
      token = token.slice(6)
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret)

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }

    req.auth = { token }
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      const { response, statusCode } = errorResponse("Invalid or expired token", 401)
      return res.status(statusCode).json(response)
    }

    const { response, statusCode } = errorResponse("Unauthorized", 401)
    return res.status(statusCode).json(response)
  }
}

module.exports = auth