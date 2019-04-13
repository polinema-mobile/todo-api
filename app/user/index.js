'use strict'

const boom = require('boom')
const joi = require('joi')
const model = require('./model')

const searchRoute = {
  method: 'GET',
  path: '/v1/users',
  handler: search,
  options: {
    auth: false
  }
}

const createRoute = {
  method: 'POST',
  path: '/v1/users',
  handler: create,
  options: {
    auth: false,
    validate: {
      payload: {
        username: joi.string().required(),
        name: joi.string().required(),
        password: joi.string().required()
      }
    }
  }
}

const showRoute = {
  method: 'GET',
  path: '/v1/users/{id}',
  handler: show
}

const updateRoute = {
  method: 'PUT',
  path: '/v1/users/{id}',
  handler: update
}

const destroyRoute = {
  method: 'DELETE',
  path: '/v1/users/{id}',
  handler: destroy
}

const routes = [searchRoute, createRoute, showRoute, updateRoute, destroyRoute]

async function search(request, h) {
  try {
    const { page, pageSize } = request.query
    const response = await model.fetchPage({ page, pageSize }).then(result => {
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
    const { payload } = request
    const response = await model.forge(payload).save()

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function show(request, h) {
  try {
    const { id } = request.params
    const response = await model.where({ id }).fetch()

    if (!response) return boom.notFound()

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

    if (id != credentials.id) return boom.forbidden()
    const response = await model.forge(id).save(payload)

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

    if (id != credentials.id) return boom.forbidden()
    const response = await model.remove(query => query.where({ id }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

module.exports = {
  name: 'user-routes',
  register: server => {
    server.route(routes)
  }
}
