'use strict'

const tableName = 'users'

exports.up = function(knex) {
  return knex
    .schema
    .createTable(tableName, table => {
      table.increments()
      table.string('username', 200).notNullable()
      table.string('name', 200).notNullable()
      table.string('password', 200).notNullable()
    })
}

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
