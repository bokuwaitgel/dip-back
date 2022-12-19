const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = {
  auth: function(req, res, next) {
  	try {
      const token = req.header('Authorization').split(' ')[1]
      if (!token) return res.status(401).json({ message: 'Auth error' })
  		const decoded = jwt.verify(token, 'randomString')
  		req.user = decoded.user
  		next()
  	} catch (e) {
  		console.log(e)
  		res.status(500).send({ message: 'Invalid token' })
  	}
  },
  authAdmin: async function(req, res, next) {
  	try {
      const token = req.header('Authorization').split(' ')[1]
      if (!token) return res.status(401).json({ message: 'Auth error' })
  		const decoded = jwt.verify(token, 'randomString')
      const user = await User.findById(decoded.user.id)
      if (user.role !== 'COORDINATOR')
        return res.status(401).json({ message: 'User isn\'t a coordinator' })
      req.user = decoded.user
  		next()
  	} catch (e) {
  		console.log(e)
  		res.status(500).send({ message: 'Invalid token' })
  	}
  },
  setRequestUser: function(req, res, next) {
  	try {
      const token = req.header('Authorization').split(' ')[1]
      if (token) {
        const decoded = jwt.verify(token, 'randomString')
        req.user = decoded.user
      }
  		next()
  	} catch {
  		next()
  	}
  }
}
