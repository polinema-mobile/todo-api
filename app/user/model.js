'use strict'

const bookshelf = require('../../lib/bookshelf')

require('../todo/model')

const User = bookshelf.Model.extend({
  tableName: 'users',
  hidden: [ 'password' ],
  todos: function () {
    return this.hasMany('Todo')
  }
})

module.exports = bookshelf.model('User', User)