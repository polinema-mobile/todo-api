'use strict'

const boom = require('boom')
const joi = require('joi')
const model = require('./model')

const searchRoute = {
  method: 'GET',
  path: '/v1/todos',
  handler: search
}

const createRoute = {
  method: 'POST',
  path: '/v1/todos',
  handler: create,
  options: {
    validate: {
      payload: {
        todo: joi.string().required()
      }
    }
  }
}

const showRoute = {
  method: 'GET',
  path: '/v1/todos/{id}',
  handler: show
}

const updateRoute = {
  method: 'PUT',
  path: '/v1/todos/{id}',
  handler: update,
  options: {
    validate: {
      payload: {
        todo: joi.string().required()
      }
    }
  }
}

const destroyRoute = {
  method: 'DELETE',
  path: '/v1/todos/{id}',
  handler: destroy
}

const doneRoute = {
  method: 'POST',
  path: '/v1/todos/{id}/done',
  handler: done
}

const undoneRoute = {
  method: 'POST',
  path: '/v1/todos/{id}/undone',
  handler: undone
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
    const { page, pageSize } = request.query

    const response = await model
      .where({ user_id: id })
      .fetchPage({ page, pageSize, withRelated: ['user'] })
      .then(result => {
        return { pagination: result.pagination, result }
      })

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

    const response = await model.forge(payload).save()

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

    const response = await model
      .where({ id, user_id: credentials.id })
      .fetch({ withRelated: ['user'] })

    if (!response) return boom.forbidden()

    return h.response(response)
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

    const todo = await model
      .where({ id, user_id: credentials.id })
      .fetch({ withRelated: ['user'] })
    if (!todo) return boom.forbidden()
    const destroyedTodo = await model.remove(query => query.where({ id }))
    if (!destroyedTodo) return boom.badImplementation()

    return h.response(todo)
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

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

module.exports = {
  name: 'todo-routes',
  register: server => {
    server.route(routes)
  }
}
