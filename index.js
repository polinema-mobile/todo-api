'use strict'

require('dotenv').config()

const glue = require('glue')
const debug = process.env.APP_DEBUG === 'true'

const manifest = {
  server: {
    host: process.env.APP_HOST || 'localhost',
    port: process.env.APP_PORT || 8000,
    router: { stripTrailingSlash: true },
    routes: {
      validate: {
        failAction: async (request, h, err) => { throw err }
      }
    }
  },
  register: {
    plugins: [
      require('inert'),
      require('vision'), {
        plugin: require('hapi-swagger'),
        options: {
          securityDefinitions: {
            jwt: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header'
            }
          }
        }
      },
      require('./app/jwt'), {
        plugin: require('./app/auth'),
        routes: { prefix: '/v1/auth' }
      }, {
        plugin: require('./app/user'),
        routes: { prefix: '/v1/users' }
      }, {
        plugin: require('./app/todo'),
        routes: { prefix: '/v1/todos' }
      }
    ]
  }
}

const routeTable = (server) => {
  server.table()
    .forEach((route) => console.log(`${route.method}\t${route.path}`))
}

const startServer = async () => {
  try {
    const server = await glue.compose(manifest)
    await server.start()
    console.log('Server running at: ', server.info.uri)

    debug && routeTable(server)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startServer()
