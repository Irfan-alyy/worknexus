function log(level, message, meta = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  console[level === "error" ? "error" : "log"](JSON.stringify(entry))
}

module.exports = {
  log,
}