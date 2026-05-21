function rbac(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.user?.role

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    return next()
  }
}

module.exports = rbac