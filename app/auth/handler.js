'use strict'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const boom = require('boom')
const model = require('../user/model')

const key = process.env.JWT_KEY
const algorithm = process.env.JWT_ALGORITHM || 'HS256'
const expiresIn = process.env.JWT_EXPIRATION || '7d'

module.exports = {
  login: async (request, h) => {
    try {
      const { username, password } = request.payload
      const userFound = await model
        .where({ username })
        .findOne()
      if (!userFound)
        return boom.notFound()
      const authenticatedUser = await bcrypt
        .compare(password, userFound.password)
      if (!authenticatedUser)
        return boom.unauthorized()
      const token = await jwt
        .sign({ id: userFound.id }, key, {
          algorithm, expiresIn
        })
      return h.response({ token })
    } catch (error) {
      console.error(error)
      return boom.badImplementation()
    }
  }
}