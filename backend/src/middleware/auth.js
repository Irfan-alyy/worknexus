function auth(req, res, next) {
  const authorization = req.headers.authorization || ""
  const cookieHeader = req.headers.cookie || ""
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : cookieHeader
        .split(";")
        .map((pair) => pair.trim())
        .find((pair) => pair.startsWith("token="))

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  req.auth = { token }
  return next()
}

module.exports = auth