'use strict'

const boom = require('boom')
const joi = require('joi')
const model = require('./model')

const searchRoute = {
  method: 'GET',
  path: '/',
  handler: search,
  options: {
    tags: ['api'],
    notes: 'Search todos'
  }
}

const createRoute = {
  method: 'POST',
  path: '/',
  handler: create,
  options: {
    tags: ['api'],
    notes: 'Create new todo',
    validate: {
      payload: {
        todo: joi.string().required()
      }
    }
  }
}

const showRoute = {
  method: 'GET',
  path: '/{id}',
  handler: show,
  options: {
    tags: ['api'],
    notes: 'Show detail information of todo'
  }
}

const updateRoute = {
  method: 'PUT',
  path: '/{id}',
  handler: update,
  options: {
    tags: ['api'],
    notes: 'Update detail of todo',
    validate: {
      payload: {
        todo: joi.string().required()
      }
    }
  }
}

const destroyRoute = {
  method: 'DELETE',
  path: '/{id}',
  handler: destroy,
  options: { 
    tags: ['api'],
    notes: 'Remove a todo'
  }
}

const doneRoute = {
  method: 'POST',
  path: '/{id}/done',
  handler: done,
  options: {
    tags: ['api']
  }
}

const undoneRoute = {
  method: 'POST',
  path: '/{id}/undone',
  handler: undone,
  options: {
    tags: ['api']
  }
}

const routes = [
  searchRoute,
  createRoute,
  showRoute,
  updateRoute,
  destroyRoute,
  doneRoute,
  undoneRoute
]

async function search(request, h) {
  try {
    const { id } = request.auth.credentials
    const { q, done, order, page, pageSize } = request.query

    const response = await model
      .query(query => {
        { query.where({ user_id: id }) }
        { (done) && query.where({ done }) }
        { (q) && query.where('todo', 'like', `%${q}%`) }
      })
      .orderBy(order)
      .fetchPage({ page, pageSize, withRelated: ['user'] })
      .then(data => ({ statusCode: 200, pagination: data.pagination, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function create(request, h) {
  try {
    const { id } = request.auth.credentials
    const { payload } = request
    payload.userId = id

    const todo = await model.forge(payload).save()
    if (!todo) return boom.badImplementation()
    const response = await model.where({ id: todo.id }).fetch()
      .then(data => ({ statusCode: 200, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function show(request, h) {
  try {
    const { credentials } = request.auth
    const { id } = request.params

    const data = await model
      .where({ id, user_id: credentials.id })
      .fetch({ withRelated: ['user'] })

    if (!data) return boom.notFound()

    return h.response({ statusCode: 200, data })
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function update(request, h) {
  try {
    const { credentials } = request.auth
    const { id } = request.params
    const { payload } = request

    const todo = await model.where({ id, user_id: credentials.id }).fetch()
    if (!todo) return boom.forbidden()
    const updatedTodo = await new model({ id }).save(payload)
    if (!updatedTodo) return boom.badImplementation()
    const response = await model.where({ id }).fetch({ withRelated: ['user'] })
      .then(data => ({ statusCode: 200, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function destroy(request, h) {
  try {
    const { credentials } = request.auth
    const { id } = request.params

    const response = await model.where({ id, user_id: credentials.id })
      .fetch({ withRelated: ['user'] })
    if (!response) return boom.forbidden()
    const destroyedTodo = await model.where({ id }).destroy()
    if (!destroyedTodo) return boom.badImplementation()

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function done(request, h) {
  try {
    const { credentials } = request.auth
    const { id } = request.params
    const payload = { done: true }

    const todo = await model.where({ id, user_id: credentials.id }).fetch()
    if (!todo) return boom.forbidden()
    const updatedTodo = await new model({ id }).save(payload)
    if (!updatedTodo) return boom.badImplementation()
    const response = await model.where({ id }).fetch({ withRelated: ['user'] })
      .then(data => ({ statusCode: 200, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function undone(request, h) {
  try {
    const { credentials } = request.auth
    const { id } = request.params
    const payload = { done: false }

    const todo = await model.where({ id, user_id: credentials.id }).fetch()
    if (!todo) return boom.forbidden()
    const updatedTodo = await new model({ id }).save(payload)
    if (!updatedTodo) return boom.badImplementation()
    const response = await model.where({ id }).fetch({ withRelated: ['user'] })
      .then(data => ({ statusCode: 200, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

module.exports = {
  name: 'todo-routes',
  register: server => server.route(routes)
}
