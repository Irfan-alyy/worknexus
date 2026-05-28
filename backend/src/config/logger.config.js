const winston = require("winston")
const path = require("path")

/**
 * Configure and initialize Winston logger
 * Logs to console (dev), files (all levels)
 */

const logsDir = path.join(__dirname, "../../logs")

// Define custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    if (stack) {
      logMessage += `\n${stack}`
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`
    }

    return logMessage
  })
)

// JSON format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const transports = [
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: process.env.NODE_ENV === "production" ? productionFormat : customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    level: "info",
    format: process.env.NODE_ENV === "production" ? productionFormat : customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
]

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            let logMessage = `[${timestamp}] ${level} ${message}`

            if (stack) {
              logMessage += `\n${stack}`
            }

            if (Object.keys(meta).length > 0) {
              logMessage += ` ${JSON.stringify(meta)}`
            }

            return logMessage
          }
        )
      ),
    })
  )
}

/**
 * Initialize logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: { service: "worknexus-backend" },
  transports,
})

module.exports = logger
