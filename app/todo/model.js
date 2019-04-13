'use strict'

const bookshelf = require('../../lib/bookshelf')

require('../user/model')

const Todo = bookshelf.Model.extend({
  tableName: 'todos',
  hidden: [ 'userId' ],
  user: function () {
    return this.belongsTo('User')
  }
})

module.exports = bookshelf.model('Todo', Todo)