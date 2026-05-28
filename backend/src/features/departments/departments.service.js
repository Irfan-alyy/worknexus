const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")

async function listDepartments() {
  try {
    return await prisma.department.findMany()
  } catch (err) {
    throw new AppError("Failed to list departments", 500, false)
  }
}

async function getDepartmentById(id) {
  try {
    return await prisma.department.findUnique({ where: { id: Number(id) }, select: {id:true, name:true, createdAt:true,  employees: {
      select:{
        id:true,
        firstName:true,
        lastName:true,
        user:{
          select:{
            role:true
          }
        }
      }
    } } })
  } catch (err) {
    throw new AppError("Failed to get department", 500, false)
  }
}

async function createDepartment(data) {
  try {
    const created = await prisma.department.create({ data })
    return created
  } catch (err) {
    if (err && err.code === "P2002") {
      throw AppError.conflict("Department with this name already exists")
    }
    throw new AppError("Failed to create department", 500, false)
  }
}

async function updateDepartment(id, data) {
  try {
    const updated = await prisma.department.update({ where: { id: Number(id) }, data })
    return updated
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Department not found")
    }
    throw new AppError("Failed to update department", 500, false)
  }
}

module.exports = {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
}
