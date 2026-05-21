function getEnvConfig() {
  const port = Number(process.env.PORT || 3000)

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number.isFinite(port) ? port : 3000,
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "",
  }
}

module.exports = {
  getEnvConfig,
}