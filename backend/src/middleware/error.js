function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` })
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500
  const message = error.message || "Internal Server Error"

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  })
}

module.exports = {
  notFound,
  errorHandler,
}