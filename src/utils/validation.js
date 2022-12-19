const jwt = require('jsonwebtoken')
const Entry = require('../models/entry')

module.exports = {
  retakingUser: async function(user, survey) {
  	try {
      const entry = await Entry.findOne({ user: user, survey: survey })
      return Boolean(entry)
  	} catch {
  		return false
  	}
  }
}
