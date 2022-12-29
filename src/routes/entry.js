const express = require('express')
const router = express.Router()
const { authAdmin, setRequestUser } = require('../middleware/auth')
const { retakingUser } = require('../utils/validation')

const Entry = require('../models/entry')
const Survey = require('../models/survey')
const EntryView = require('../views/entry')

router.post('/', setRequestUser, async (req, res) => {
	const { answers, survey } = req.body
	try {
		if (req.user && await retakingUser(req.user.id, survey))
			return res.status(400).json({
				message: 'You have already taken this survey'
			})

		const surveyInstance = await Survey.findById(survey)

		if (surveyInstance.status !== 'ACTIVE')
			return res.status(400).json({
				message: 'This survey isn\'t active'
			})

		let entry = new Entry({
			answers,
			survey,
			user: req.user ? req.user.id : null
		})

		await entry.save()

		res.status(200).json(
			EntryView(entry)
		)
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get('/', authAdmin, async (req, res) => {
	const populate = ['user']
	try {
		const entries = await Entry.find({}).populate(populate)
		res.status(200).json(
			entries.map(i => EntryView(i, populate))
		)
	} catch (err) {
		res.status(500).send(err)
	}
})

module.exports = router
