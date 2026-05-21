const cors = require("cors")
const { getEnvConfig } = require("../config/env.config")

/**
 * CORS middleware configuration
 */

const { nodeEnv } = getEnvConfig()

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
]

// Add production origins from env if provided
if (process.env.ALLOWED_ORIGINS) {
  const additionalOrigins = process.env.ALLOWED_ORIGINS.split(",")
  allowedOrigins.push(...additionalOrigins)
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin) || nodeEnv === "development") {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
}

module.exports = cors(corsOptions)
