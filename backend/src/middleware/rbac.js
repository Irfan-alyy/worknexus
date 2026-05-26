const { errorResponse } = require("../utils/response")

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Creates middleware that checks if user has required roles
 * @param {Array<string>} allowedRoles - Roles that are allowed
 * @returns {Function} Express middleware function
 */

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // Check if user is authenticated (attached by auth middleware)
    const userRole = req.user?.role

    if (!userRole) {
      const { response, statusCode } = errorResponse("Unauthorized", 401)
      return res.status(statusCode).json(response)
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      const { response, statusCode } = errorResponse(
        "You do not have permission to access this resource",
        403
      )
      return res.status(statusCode).json(response)
    }

    next()
  }
}

module.exports = requireRole