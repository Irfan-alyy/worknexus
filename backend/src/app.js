const express = require("express")
const authRoutes = require("./features/auth/auth.routes")
const chatRoutes = require("./features/chat/chat.routes")
const payrollRoutes = require("./features/payroll/payroll.routes")
const employeeRoutes = require("./features/hr-management/employee.routes")
const rateLimiter = require("./middleware/rate-limiter")
const { notFound, errorHandler } = require("./middleware/error")
const prisma = require("./config/db.config")

const app = express()

app.use(express.json())
app.use(rateLimiter({ limit: 200, windowMs: 60_000 }))

app.get("/health", (req, res) => {
  res.json({ success: true, message: "ok" })
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/chat", chatRoutes)
app.use("/api/v1/payroll", payrollRoutes)
app.use("/api/v1/employees", employeeRoutes)
 
 // Test route for departments
 app.get("/api/v1/test/departments", async (req, res) => {
  try {
    const data= await prisma.department.findMany()
     res.json({ success: true, message: "Database connection test endpoint", data: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
 })

app.use(notFound)
app.use(errorHandler)

module.exports = app