'use strict'

const bcrypt = require('bcrypt')
const bookshelf = require('../../lib/bookshelf')

require('../todo/model')

const User = bookshelf.Model.extend({
  initialize: function () {
    this.on('saving', this.hashPassword)
  },
  tableName: 'users',
  hidden: [ 'password' ],
  todos: function () {
    return this.hasMany('Todo')
  },
  hashPassword: async (model) => {
    const password = model.get('password')
    password && await bcrypt.hash(password, 10)
      .then(hash => model.set('password', hash))
  }
})

module.exports = bookshelf.model('User', User)
