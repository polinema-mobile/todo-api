'use strict'

const bcrypt = require('bcrypt')
const boom = require('boom')
const joi = require('joi')
const model = require('./model')

const searchRoute = {
  method: 'GET',
  path: '/',
  handler: search,
  options: {
    auth: false
  }
}

const createRoute = {
  method: 'POST',
  path: '/',
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
  path: '/{id}',
  handler: show,
  options: {
    auth: false
  }
}

const updateRoute = {
  method: 'PUT',
  path: '/{id}',
  handler: update,
  options: {
    validate: {
      payload: {
        name: joi.string().required(),
      }
    }
  }
}

const destroyRoute = {
  method: 'DELETE',
  path: '/{id}',
  handler: destroy
}

const changePasswordRoute = {
  method: 'POST',
  path: '/password',
  handler: changePassword,
  options: {
    validate: {
      payload: {
        currentPassword: joi.string().required(),
        password: joi.string().required(),
      }
    }
  }
}

const routes = [
  searchRoute,
  createRoute,
  showRoute,
  updateRoute,
  destroyRoute,
  changePasswordRoute,
]

async function search(request, h) {
  try {
    const { order, page, pageSize } = request.query
    const response = await model
      .orderBy(order)
      .fetchPage({ page, pageSize })
      .then(data => ({ statusCode: 200, pagination: data.pagination, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function create(request, h) {
  try {
    const { payload } = request
    const { username } = payload
    const userFound = await model.where({ username }).fetch()
    if (userFound) return boom.conflict('user is already exists')
    const response = await model.forge(payload).save()
      .then(data => ({ statusCode: 200, data }))

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
      .then(data => ({ statusCode: 200, data }))

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
    const user = await new model({ id }).save(payload)
    if (!user) return boom.badImplementation()
    const response = await model.where({ id }).fetch()
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

    if (id != credentials.id)
      return boom.forbidden()
    const response = await model.where({ id }).fetch()
      .then(data => ({ statusCode: 200, data }))
    const user = await model.where({ id }).destroy()
    if (!user)
      return boom.badImplementation()

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

async function changePassword(request, h) {
  try {
    const { id } = request.auth.credentials
    const { currentPassword } = request.payload

    const userFound = await model.where({ id }).fetch()
    const authenticatedUser = await bcrypt.compare(currentPassword, userFound.get('password'))
    if (!authenticatedUser)
      return boom.unauthorized()

    const { payload } = request
    delete payload.currentPassword
    const user = await new model({ id }).save(payload)
    if (!user)
      return boom.badImplementation()
    const response = await model.where({ id }).fetch()
      .then(data => ({ statusCode: 200, data }))

    return h.response(response)
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

module.exports = {
  name: 'user-routes',
  register: server => server.route(routes)
}
