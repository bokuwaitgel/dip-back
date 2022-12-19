const jwt = require('jsonwebtoken')
let functions = {}

functions.signin = (user) => {
	return new Promise((resolve, reject) => {
		const payload = {
			user: {
				id: user.id
			}
		}

		jwt.sign(payload, 'randomString', { expiresIn: 9999999 },
			(err, token) => {
				if (err) reject(err)
				else resolve(token)
			}
		)
	})
}

module.exports = functions
