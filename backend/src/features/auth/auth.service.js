function login({ email, password }) {
  return {
    user: {
      id: "demo-user",
      email,
      role: "EMPLOYEE",
    },
    token: `demo-token-for-${email}`,
    passwordMatched: Boolean(password),
  }
}

module.exports = {
  login,
}