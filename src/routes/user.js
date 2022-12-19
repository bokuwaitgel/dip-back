const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { auth } = require('../middleware/auth')
const { signin } = require('../utils/functions')

const User = require('../models/user')
const UserView = require('../views/user')

router.post('/', check('email').isEmail(), async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({
			message: 'Please enter a valid email'
		})
	}

	const { username, email, password, name } = req.body
	const role = req.body.role ? req.body.role.toUpperCase() : 'RESPONDENT'
	try {
		let user = new User({
			username,
			email: email.toLowerCase(),
			password,
			role,
			name
		})

		if (role !== 'COORDINATOR' && role !== 'RESPONDENT')
			return res.status(400).json({
				message: 'Invalid user role'
			})

		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(password, salt)

		await user.save()

		const token = await signin(user)
		res.status(200).json({
			token,
			user: UserView(user)
		})
	} catch (err) {
		res.status(500).send(err.message)
	}
}
)

router.post(
	'/auth',
	[
		check('email').isEmail()
	],
	async (req, res) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: 'Please enter a valid email'
			})
		}

		const { email, password } = req.body

		try {
			const user = await User.findOne({
				email: email.toLowerCase()
			})
			if (!user)
				return res.status(400).json({
					message: 'User does not exist'
				})

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch)
				return res.status(400).json({
					message: 'Incorrect password'
				})

			const token = await signin(user)
			res.status(200).json({
				token,
				user: UserView(user)
			})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
)

router.get('/me', auth, async (req, res) => {
	try {
		// request.user is getting fetched from Middleware after token authentication
		const user = await User.findById(req.user.id)
		res.json(UserView(user))
	} catch (e) {
		res.send({ message: 'Error in fetching user' })
	}
})

module.exports = router
