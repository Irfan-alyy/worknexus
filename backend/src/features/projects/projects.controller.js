const {
  listProjects,
  getProjectById,
  listProjectTasks,
  createProject,
  updateProject,
  addTeamMember,
  removeTeamMember,
  listProjectTeam,
  isTeamMember,
  isProjectManager,
  getEmployeeById,
} = require("./projects.service")

const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")

async function listProjectsController(req, res, next) {
  try {
    const user = req.user
    const data = await listProjects(user)
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getProjectController(req, res, next) {
  try {
    const { id } = req.params
    const project = await getProjectById(id)
    if (!project) throw AppError.notFound("Project not found")

    const user = req.user
    if (user.role === "admin" || user.role === "hr") {
      const { response, statusCode } = successResponse(project)
      return res.status(statusCode).json(response)
    }

    if (user.role === "pm") {
      const ok = await isProjectManager(id, user.id)
      if (!ok) throw AppError.forbidden()
      const { response, statusCode } = successResponse(project)
      return res.status(statusCode).json(response)
    }

    // employee
    const member = await isTeamMember(id, user.id)
    if (!member) throw AppError.forbidden()
    const { response, statusCode } = successResponse(project)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function listProjectTasksController(req, res, next) {
  try {
    const { id } = req.params
    const project = await getProjectById(id)
    if (!project) throw AppError.notFound("Project not found")

    const user = req.user
    if (user.role !== "admin" && user.role !== "hr") {
      if (user.role === "pm") {
        const ok = await isProjectManager(id, user.id)
        if (!ok) throw AppError.forbidden()
      } else {
        const member = await isTeamMember(id, user.id)
        if (!member) throw AppError.forbidden()
      }
    }

    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 5)
    const data = await listProjectTasks(id, { page, limit })
    const { response, statusCode } = successResponse({ projectId: id, ...data })
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createProjectController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    // Validate manager_employee_id if provided
    if (payload.manager_employee_id !== undefined && payload.manager_employee_id !== null) {
      const mgr = await getEmployeeById(payload.manager_employee_id)
      if (!mgr) {
        throw AppError.notFound("manager_employee_id references a non-existent employee")
      }
      if (mgr.user?.role !== "pm") {
        throw AppError.validationError("Invalid manager_employee_id", [
          { field: "manager_employee_id", message: "Referenced user is not a project manager" },
        ])
      }
    }

    const created = await createProject(payload)
    const { response, statusCode } = successResponse(created, "Project created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateProjectController(req, res, next) {
  try {
    const { id } = req.params
    const payload = req.validatedBody || req.body

    // admin/hr can update any project. pm can update only if manager.
    const user = req.user
    if (user.role === "pm") {
      const ok = await isProjectManager(id, user.id)
      if (!ok) throw AppError.forbidden()
      const allowedKeys = new Set(["status"])
      const disallowedFields = Object.keys(payload || {}).filter((key) => !allowedKeys.has(key) && payload[key] !== undefined)
      if (disallowedFields.length) {
        throw AppError.forbidden("Project managers can only update project status")
      }
    }

    // Validate manager_employee_id if provided
    if (payload.manager_employee_id !== undefined && payload.manager_employee_id !== null) {
      const mgr = await getEmployeeById(payload.manager_employee_id)
      if (!mgr) {
        throw AppError.notFound("manager_employee_id references a non-existent employee")
      }
      if (mgr.user?.role !== "pm") {
        throw AppError.validationError("Invalid manager_employee_id", [
          { field: "manager_employee_id", message: "Referenced user is not a project manager" },
        ])
      }
    }

    const updated = await updateProject(id, payload)
    const { response, statusCode } = successResponse(updated, "Project updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function listProjectTeamController(req, res, next) {
  try {
    const { id } = req.params
    const user = req.user

    // reuse visibility: admin/hr see any, pm/employee must be manager or member
    if (!(user.role === "admin" || user.role === "hr")) {
      if (user.role === "pm") {
        const ok = await isProjectManager(id, user.id)
        if (!ok) throw AppError.forbidden()
      } else {
        const member = await isTeamMember(id, user.id)
        if (!member) throw AppError.forbidden()
      }
    }

    const data = await listProjectTeam(id)
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function addTeamMemberController(req, res, next) {
  try {
    const { id } = req.params
    const { employee_ids} = req.validatedBody || req.body

    const user = req.user
    // admin/hr allowed; pm allowed only if manager
    if (user.role === "pm") {
      const ok = await isProjectManager(id, user.id)
      if (!ok) throw AppError.forbidden()
    }

    const created = await addTeamMember(id, employee_ids)
    const { response, statusCode } = successResponse(created, "Team member added", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function removeTeamMemberController(req, res, next) {
  try {
    const { id, employeeId } = req.params
    const user = req.user
    if (user.role === "pm") {
      const ok = await isProjectManager(id, user.id)
      if (!ok) throw AppError.forbidden()
    }

    const removed = await removeTeamMember(id, Number(employeeId))
    const { response, statusCode } = successResponse(removed, "Team member removed")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listProjectsController,
  getProjectController,
  listProjectTasksController,
  createProjectController,
  updateProjectController,
  listProjectTeamController,
  addTeamMemberController,
  removeTeamMemberController,
}
