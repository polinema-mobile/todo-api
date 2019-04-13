'use strict'

const knexfile = require('../knexfile')
const knex = require('knex')(knexfile[process.env.APP_ENV])
const bookshelf = require('bookshelf')(knex)

bookshelf.plugin('registry')
bookshelf.plugin('pagination')
bookshelf.plugin('case-converter')
bookshelf.plugin('visibility')
bookshelf.plugin('processor')

module.exports = bookshelf
