const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")

async function listClients() {
  try {
    return await prisma.client.findMany()
  } catch (err) {
    throw new AppError("Failed to list clients", 500, false)
  }
}

async function getClientById(id) {
  try {
    return await prisma.client.findUnique({ where: { id: Number(id) } })
  } catch (err) {
    throw new AppError("Failed to get client", 500, false)
  }
}

async function createClient(data) {
  try {
    const created = await prisma.client.create({ data })
    return created
  } catch (err) {
    if (err && err.code === "P2002") {
      throw AppError.conflict("Client with this unique field already exists")
    }
    throw new AppError("Failed to create client", 500, false)
  }
}

async function updateClient(id, data) {
  try {
    const updated = await prisma.client.update({ where: { id: Number(id) }, data })
    return updated
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Client not found")
    }
    throw new AppError("Failed to update client", 500, false)
  }
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
}
