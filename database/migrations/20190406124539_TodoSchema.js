'use strict'

const tableName = 'todos'

exports.up = function(knex) {
  return knex
    .schema
    .createTable(tableName, table => {
      table.increments()
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id')
      table.string('todo', 200).notNullable()
      table.boolean('done').defaultTo(false)
    })
}

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
