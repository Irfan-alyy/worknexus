const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const prisma = require("../../config/db.config")
const { getEnvConfig } = require("../../config/env.config")
const {log} = require("../../utils/logger")

/**
 * Hash a password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload { id, email, role }
 * @returns {string} JWT token
 */
function generateToken(payload) {
  const { jwtSecret } = getEnvConfig()
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"
  return jwt.sign(payload, jwtSecret, { expiresIn })
}

/**
 * Register a new user
 * @param {Object} data - { email, password, role }
 * @returns {Promise<Object>} Created user and token
 */
async function register({ email, password, role = "employee" }) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    })

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    log("info",`User registered: ${email} with role: ${role}`)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }
  } catch (error) {
    log("error",`Registration error: ${error.message}`, error)
    throw error
  }
}

/**
 * Login user
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>} User, token, and role
 */
async function login({ email, password }) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Compare password
    const passwordMatched = await comparePassword(password, user.password)

    if (!passwordMatched) {
      throw new Error("Invalid email or password")
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    log("info", `User logged in: ${email}`)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }
  } catch (error) {
    log("error",`Login error: ${error.message}`, error)
    throw error
  }
}

module.exports = {
  register,
  login,
  hashPassword,
  comparePassword,
  generateToken,
}