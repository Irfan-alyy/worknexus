const http = require("http")
const app = require("./src/app")
const { getEnvConfig } = require("./src/config/env.config")
const { log } = require("./src/utils/logger")
// At the absolute top of app.js
require('dotenv').config(); 


const { port } = getEnvConfig()
const server = http.createServer(app)

server.listen(port, () => {
    log("info", `server running on port ${port}`)
})

