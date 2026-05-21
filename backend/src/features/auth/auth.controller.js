const { register, login } = require("./auth.service")
const { validateLoginPayload, validateRegisterPayload } = require("./auth.schema")
const { successResponse, errorResponse } = require("../../utils/response")
const {log} = require("../../utils/logger")

/**
 * Register Controller
 * POST /api/v1/auth/register
 * Creates a new user account
 */
async function registerController(req, res) {
  try {
    const validation = validateRegisterPayload(req.body)

    if (!validation.valid) {
      const { response, statusCode } = errorResponse(
        "Validation failed",
        400,
        validation.errors
      )
      return res.status(statusCode).json(response)
    }

    const result = await register(validation.data)

    const { response, statusCode } = successResponse(
      result,
      "User registered successfully",
      201
    )
    return res.status(statusCode).json(response)
  } catch (error) {
    log("error",`Register controller error: ${error.message}`, error)

    // Check if error is due to duplicate email
    if (error?.message?.includes("already exists")) {
      const { response, statusCode } = errorResponse(error.message, 409)
      return res.status(statusCode).json(response)
    }

    const { response, statusCode } = errorResponse(
      error?.message || "Registration failed",
      500
    )
    return res.status(statusCode).json(response)
  }
}

/**
 * Login Controller
 * POST /api/v1/auth/login
 * Authenticates user and returns JWT token
 */
async function loginController(req, res) {
  try {
    const validation = validateLoginPayload(req.body)

    if (!validation.valid) {
      const { response, statusCode } = errorResponse(
        "Validation failed",
        400,
        validation.errors
      )
      return res.status(statusCode).json(response)
    }

    const result = await login(validation.data)

    // Optional: Set token in httpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    const { response, statusCode } = successResponse(result, "Login successful")
    return res.status(statusCode).json(response)
  } catch (error) {
    log("error",`Login controller error: ${error.message}`, error)

    const { response, statusCode } = errorResponse(
      error?.message || "Login failed",
      401
    )
    return res.status(statusCode).json(response)
  }
}

/**
 * Logout Controller
 * POST /api/v1/auth/logout
 * Clears authentication (mainly for cookie-based auth)
 */
function logoutController(req, res) {
  try {
    res.clearCookie("token")

    const { response, statusCode } = successResponse(null, "Logged out successfully")
    return res.status(statusCode).json(response)
  } catch (error) {
    log("error",`Logout controller error: ${error.message}`, error)

    const { response, statusCode } = errorResponse("Logout failed", 500)
    return res.status(statusCode).json(response)
  }
}

/**
 * Get Current User (Me) Controller
 * GET /api/v1/auth/me
 * Returns authenticated user information
 */
function meController(req, res) {
  try {
    if (!req.user) {
      const { response, statusCode } = errorResponse("User not found", 404)
      return res.status(statusCode).json(response)
    }

    const { response, statusCode } = successResponse(req.user, "User info retrieved")
    return res.status(statusCode).json(response)
  } catch (error) {
    log("error",`Me controller error: ${error.message}`, error)

    const { response, statusCode } = errorResponse("Failed to retrieve user info", 500)
    return res.status(statusCode).json(response)
  }
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  meController,
}