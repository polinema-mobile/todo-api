'use strict'

require('dotenv').config()

const hapi = require('hapi')
const server = hapi.server({
  host: process.env.APP_HOST || 'localhost',
  port: process.env.APP_PORT || 8000,
  router: { stripTrailingSlash: true }
})

const start = async () => {
  try {
    const plugins = [
      require('./app/jwt'),
      require('./app/auth'),
      require('./app/user'),
      require('./app/todo'),
    ]

    await server.register(plugins)
    await server.start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  console.log('Server running at: ', server.info.uri)
}

start()
