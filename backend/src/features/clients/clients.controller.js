const {
  listClients,
  getClientById,
  createClient,
  updateClient,
} = require("./clients.service")
const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")

async function listClientsController(req, res, next) {
  try {
    const data = await listClients()
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getClientController(req, res, next) {
  try {
    const { id } = req.params
    const client = await getClientById(id)
    if (!client) throw AppError.notFound("Client not found")
    const { response, statusCode } = successResponse(client)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createClientController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const created = await createClient(payload)
    const { response, statusCode } = successResponse(created, "Client created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateClientController(req, res, next) {
  try {
    const { id } = req.params
    const payload = req.validatedBody || req.body
    const updated = await updateClient(id, payload)
    const { response, statusCode } = successResponse(updated, "Client updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listClientsController,
  getClientController,
  createClientController,
  updateClientController,
}
