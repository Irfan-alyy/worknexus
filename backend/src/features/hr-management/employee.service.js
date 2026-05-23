const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { hashPassword } = require("../auth/auth.service")

function normalizeEmployeeData(input = {}) {
  return {
    firstName: input.firstName ?? input.first_name,
    lastName: input.lastName ?? input.last_name,
    departmentId:
      input.departmentId !== undefined
        ? input.departmentId
        : input.department_id !== undefined
          ? input.department_id
          : undefined,
    paymentModel: input.paymentModel ?? input.payment_model,
    baseSalary:
      input.baseSalary !== undefined
        ? input.baseSalary
        : input.base_salary !== undefined
          ? input.base_salary
          : undefined,
    hourlyRate:
      input.hourlyRate !== undefined
        ? input.hourlyRate
        : input.hourly_rate !== undefined
          ? input.hourly_rate
          : undefined,
  }
}

async function listEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
      },
    })
    return employees
  } catch (err) {
    throw new AppError("Failed to fetch employees", 500, false)
  }
}

async function getEmployeeById(id) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
      },
    })
    return employee
  } catch (err) {
    throw new AppError("Failed to fetch employee", 500, false)
  }
}

async function createEmployee(input) {
  try {
    const { email, password } = input
    const employeeData = normalizeEmployeeData(input)
    const roleToCreate = input.role || "employee"

    const created = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } })

      if (existingUser) {
        throw AppError.conflict("User with this email already exists")
      }

      const hashedPassword = await hashPassword(password)

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: roleToCreate,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      const employee = await tx.employee.create({
        data: {
          ...employeeData,
          userId: user.id,
        },
        include: {
          user: {
            select: { id: true, email: true, role: true, createdAt: true },
          },
        },
      })

      return { user, employee }
    })

    return created
  } catch (err) {
    // Prisma unique constraint handling
    if (err && err.code === "P2002") {
      throw AppError.conflict("An account with this email already exists")
    }

    if (err && err.code === "P2003") {
      throw new AppError("Invalid department selected", 400, true)
    }

    if (err?.statusCode) {
      throw err
    }

    throw new AppError("Failed to create employee account", 500, false)
  }
}

async function updateEmployee(id, data) {
  try {
    const updated = await prisma.employee.update({
      where: { id: Number(id) },
      data: normalizeEmployeeData(data),
    })
    return updated
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Employee not found")
    }
    throw new AppError("Failed to update employee", 500, false)
  }
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
}