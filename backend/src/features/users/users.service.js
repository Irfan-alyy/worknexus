const prisma = require("../../config/db.config")
const bcrypt = require("bcryptjs")
const AppError = require("../../utils/app-error")
const { getBcryptConfig } = require("../../config/auth.config")

const { saltRounds } = getBcryptConfig()

async function listUsers() {
  try {
    return await prisma.user.findMany({ select: { id: true, email: true, role: true } })
  } catch (err) {
    throw new AppError("Failed to list users", 500, false)
  }
}

async function getUserById(id) {
  try {
    return await prisma.user.findUnique({ where: { id: Number(id) }, select: { id: true, email: true, role: true } })
  } catch (err) {
    throw new AppError("Failed to fetch user", 500, false)
  }
}

// Helper function to extract firstName from payload or email
function getFirstName(payload, email) {
  if (payload && (payload.firstName || payload.first_name)) return payload.firstName || payload.first_name
  const localPart = String(email || "").split("@")[0] || ""
  return localPart
}

// Helper function to extract lastName from payload
function getLastName(payload) {
  if (payload && (payload.lastName || payload.last_name)) return payload.lastName || payload.last_name
  return ""
}

// Ensure a minimal employee record exists for a user
async function ensureEmployeeExists(userId, payload = {}, email) {
  try {
    const existing = await prisma.employee.findUnique({ where: { userId } })
    if (!existing) {
      await prisma.employee.create({
        data: {
          userId,
          firstName: getFirstName(payload, email),
          lastName: getLastName(payload),
        },
      })
    }
  } catch (err) {
    // Log and continue; do not make user creation fail due to employee creation
    console.error("ensureEmployeeExists error:", err?.message || err)
  }
}

async function createUser(data) {
  try {
    const hashed = await bcrypt.hash(data.password, saltRounds)
    const created = await prisma.user.create({ data: { email: data.email, password: hashed, role: data.role } })

    // If role is pm, ensure minimal employee record
    if (data.role === "pm") {
      await ensureEmployeeExists(created.id, data, data.email)
    }

    return { id: created.id, email: created.email, role: created.role }
  } catch (err) {
    if (err && err.code === "P2002") {
      throw AppError.conflict("User with this email already exists")
    }
    throw new AppError("Failed to create user", 500, false)
  }
}

async function updateUser(id, data) {
  try {
    const userId = Number(id)
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) throw AppError.notFound("User not found")

    const updateData = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, saltRounds)
    }

    const updated = await prisma.user.update({ where: { id: userId }, data: updateData })

    // If role changed to pm, ensure employee exists
    if (data.role && data.role === "pm" && existingUser.role !== "pm") {
      await ensureEmployeeExists(updated.id, data, updated.email)
    }

    return { id: updated.id, email: updated.email, role: updated.role }
  } catch (err) {
    if (err instanceof AppError) throw err
    if (err && err.code === "P2025") {
      throw AppError.notFound("User not found")
    }
    throw new AppError("Failed to update user", 500, false)
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  ensureEmployeeExists,
}
