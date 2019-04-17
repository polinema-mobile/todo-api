'use strict'

require('dotenv').config()

const migrations = {
  directory: './database/migrations',
  tableName: 'migrations',
}

const seeds = {
  directory: './database/seeds',
  tableName: 'seeds',
}

const connection = {
  charset: 'utf8',
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}

module.exports = {
  development: {
    migrations,
    seeds,
    debug: true,
    client: 'mysql',
    connection,
  },
  production: {
    migrations,
    seeds,
    debug: process.env.APP_DEBUG,
    client: 'mysql',
    connection,
  }
}
