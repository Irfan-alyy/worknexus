const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
} = require("./users.service")

async function listUsersController(req, res, next) {
  try {
    const users = await listUsers()
    const { response, statusCode } = successResponse(users)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getUserController(req, res, next) {
  try {
    const { id } = req.params
    // allow admin or the owner
    if (req.user.role !== "admin" && Number(req.user.id) !== Number(id)) {
      throw AppError.forbidden()
    }
    const user = await getUserById(id)
    if (!user) throw AppError.notFound("User not found")
    const { response, statusCode } = successResponse(user)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createUserController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const created = await createUser(payload)
    const { response, statusCode } = successResponse(created, "User created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateUserController(req, res, next) {
  try {
    const { id } = req.params
    // admin or owner allowed
    if (req.user.role !== "admin" && Number(req.user.id) !== Number(id)) {
      throw AppError.forbidden()
    }
    const payload = req.validatedBody || req.body
    const updated = await updateUser(id, payload)
    const { response, statusCode } = successResponse(updated, "User updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listUsersController,
  getUserController,
  createUserController,
  updateUserController,
}
