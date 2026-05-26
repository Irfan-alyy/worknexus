const http = require("http")
const app = require("./src/app")
const { getEnvConfig } = require("./src/config/env.config")
const { log } = require("./src/utils/logger")
const { startPayrollScheduler, stopPayrollScheduler } = require("./src/jobs/payroll.scheduler")
// At the absolute top of app.js
require('dotenv').config(); 


const { port } = getEnvConfig()
const server = http.createServer(app)

startPayrollScheduler()

const shutdown = () => {
    stopPayrollScheduler()
    server.close(() => {
        log("info", "server closed")
        process.exit(0)
    })
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

server.listen(port, () => {
    log("info", `server running on port ${port}`)
})

