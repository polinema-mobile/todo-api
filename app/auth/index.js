'use strict'

const joi = require('joi')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const boom = require('boom')
const model = require('../user/model')

const key = process.env.JWT_KEY || 'veryveryverysecret'
const algorithm = process.env.JWT_ALGORITHM || 'HS256'
const expiresIn = process.env.JWT_EXPIRATION || '7d'

const loginRoute = {
  method: 'POST',
  path: '/token',
  handler: token,
  options: {
    auth: false,
    validate: {
      payload: {
        username: joi.string().required(),
        password: joi.string().required(),
      }
    }
  }
}

async function token(request, h) {
  try {
    const { username, password } = request.payload

    const userFound = await model
      .query(query => query.where({ username }))
      .fetch()
    if (!userFound)
      return boom.notFound()

    const authenticatedUser = await bcrypt.compare(password, userFound.get('password'))
    if (!authenticatedUser)
      return boom.unauthorized()

    const token = await jwt.sign({ id: userFound.id }, key, { algorithm, expiresIn })
    return h.response({ statusCode: 200, data: token })
  } catch (error) {
    console.error(error)
    return boom.badImplementation()
  }
}

module.exports = {
  name: 'auth-routes',
  register: server => server.route(loginRoute)
}
