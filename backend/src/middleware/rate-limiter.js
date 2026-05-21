const requestBuckets = new Map()

function rateLimiter({ limit = 100, windowMs = 60_000 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown"
    const now = Date.now()
    const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + windowMs }

    if (now > bucket.resetAt) {
      bucket.count = 0
      bucket.resetAt = now + windowMs
    }

    bucket.count += 1
    requestBuckets.set(key, bucket)

    if (bucket.count > limit) {
      return res.status(429).json({ success: false, message: "Too many requests" })
    }

    return next()
  }
}

module.exports = rateLimiter