'use strict'

const bookshelf = require('../../lib/bookshelf')

require('../user/model')

const Todo = bookshelf.Model.extend({
  tableName: 'todos',
  hidden: [ 'userId' ],
  user: function () {
    return this.belongsTo('User')
  },
  processors: {
    done: (value) => (!!value)
  }
})

module.exports = bookshelf.model('Todo', Todo)
