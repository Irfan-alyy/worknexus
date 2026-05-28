const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { hashPassword } = require("../auth/auth.service")

function mapProjectSummary(project) {
  if (!project) return null

  return {
    id: project.id,
    name: project.name,
    status: project.status,
    clientId: project.clientId,
    managerEmployeeId: project.managerEmployeeId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    client: project.client
      ? {
          id: project.client.id,
          name: project.client.name,
          company: project.client.company,
        }
      : undefined,
  }
}

function mapTaskSummary(task) {
  if (!task) return null

  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    project: task.project
      ? {
          id: task.project.id,
          name: task.project.name,
          status: task.project.status,
        }
      : undefined,
  }
}

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
    revenueSharePercent:
      input.revenueSharePercent !== undefined
        ? input.revenueSharePercent
        : input.revenue_share_percent !== undefined
          ? input.revenue_share_percent
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
    const employeeId = Number(id)
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
        },
        department: {
          select: { id: true, name: true, createdAt: true },
        },
        managedProjects: {
          include: {
            client: {
              select: { id: true, name: true, company: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        teamMemberships: {
          include: {
            project: {
              include: {
                client: {
                  select: { id: true, name: true, company: true },
                },
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
        tasks: {
          include: {
            project: {
              select: { id: true, name: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!employee) return null

    const managedProjects = employee.user?.role === "pm"
      ? employee.managedProjects.map(mapProjectSummary).filter(Boolean)
      : []

    const teamProjects = employee.user?.role === "employee"
      ? employee.teamMemberships.map((membership) => mapProjectSummary(membership.project)).filter(Boolean)
      : []

    const recentTasks = employee.tasks.map(mapTaskSummary).filter(Boolean)

    return {
      ...employee,
      managedProjects,
      teamProjects,
      recentTasks,
    }
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