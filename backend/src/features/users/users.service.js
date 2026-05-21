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

async function createUser(data) {
  try {
    const hashed = await bcrypt.hash(data.password, saltRounds)
    const created = await prisma.user.create({ data: { email: data.email, password: hashed, role: data.role } })
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
    const updateData = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, saltRounds)
    }
    const updated = await prisma.user.update({ where: { id: Number(id) }, data: updateData })
    return { id: updated.id, email: updated.email, role: updated.role }
  } catch (err) {
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
}
