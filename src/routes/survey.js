const express = require('express')
const router = express.Router()
const { auth, authAdmin, setRequestUser } = require('../middleware/auth')
const { retakingUser } = require('../utils/validation')

const Survey = require('../models/survey')
const Question = require('../models/question')
const Entry = require('../models/entry')
const User = require('../models/user')

const SurveyView = require('../views/survey')
const EntryView = require('../views/entry')
const QuestionView = require('../views/question')
const ResultView = require('../views/result')
const ResultViewUser = require('../views/resultUser')

router.get('/', setRequestUser, async (req, res) => {
	const populate = ['createdBy']
	try {
		const user = req.user ? await User.findById(req.user.id) : {}
		let surveys = await Survey.find({}).populate(populate)
		surveys = surveys.filter(i => {
			return user.role === 'COORDINATOR' || i.status === 'ACTIVE' || i.status === 'CLOSED'
		})
		res.status(200).json(
			surveys.map(i => SurveyView(i, populate))
		)
	} catch (err) {
		// console.log(err)
		res.status(500).send(err.message)
	}
})

router.get('/:id', setRequestUser, async (req, res) => {
	const populate = ['questions']
	try {
		const taken = Boolean(req.user) && await retakingUser(req.user.id, req.params.id)
		const survey = await Survey.findById(req.params.id).populate(populate)

		res.status(200).json({
			...SurveyView(survey, populate),
			taken
		})
	} catch (err) {
		res.status(500).send(err.message)
	}
})


router.get('/:id/entries', async (req, res) => {
	try {
		const entries = await Entry.find({ survey: req.params.id })

		res.status(200).json(
			entries.map(i => EntryView(i))
		)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})
// router.get('/:id/person', async (req, res) => {
// 	try {
// 		const entries = await Entry.find({ user: req.params.id })

// 		res.status(200).json(
// 			entries.map(i => EntryView(i))
// 		)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send(err)
// 	}
// })
router.get('/:id/:sur/person', async (req, res) => {
	const populate = ['questions', 'createdBy']
	try {
		const survey = await Survey.findById(req.params.sur).populate(populate)
		const entries = await Entry.find({ user: req.params.id, survey : req.params.sur })
		// console.log(entries)
		let result = 0
		
		await entries.forEach((i) => {
			i.answers.forEach((j)=>{
				result +=parseInt(j.score)
			})
		})
		let qRes = survey.questions.map(i => QuestionView(i))
		await qRes.forEach(async (item) => {
			item.result = [
				0, 0, 0, 0, 0
			]
			await entries.forEach((i) => {
				const questionAns = i.answers.find(x => {
					const id1 = x.question.toString()
					const id2 = item.id.toString()
					return id1 == id2
				}).answer
				const index = item.options.indexOf(questionAns)
				item.result[index] = item.result[index] ? item.result[index] + 1 : 1
			})
		})
		res.status(200).json(
			ResultViewUser(survey, populate, result, qRes)
		)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})
router.get('/:id/result', async (req, res) => {
	const populate = ['questions', 'createdBy']
	try {
		const survey = await Survey.findById(req.params.id).populate(populate)
		const entries = await Entry.find({ survey: req.params.id })

		let result = survey.questions.map(i => QuestionView(i))
		await result.forEach(async (item) => {
			item.result = [
				0, 0, 0, 0, 0
			]
			await entries.forEach((i) => {
				const questionAns = i.answers.find(x => {
					const id1 = x.question.toString()
					const id2 = item.id.toString()
					return id1 == id2
				}).answer
				const index = item.options.indexOf(questionAns)
				item.result[index] = item.result[index] ? item.result[index] + 1 : 1
			})
		})
		res.status(200).json(
			ResultView(survey, populate, result)
		)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post('/', authAdmin, async (req, res) => {
	const { title, questions, description, status } = req.body
	try {
		if (!title)
			return res.status(400).json({
				message: 'Please enter a title for your survey'
			})
		if (!questions || questions.length === 0 )
			return res.status(400).json({ 
				message: 'A survey must have 1 '
			})
		if (questions.find(item => !item.options || item.options.length === 0 || item.options.length > 5))
			return res.status(400).json({
				message: 'Every survey question must have 1 to 5 options'
			})
		let questionsRef = await Question.insertMany(questions)

		let survey = new Survey({
			title,
			description,
			questions: questionsRef.map(i => i.id),
			createdBy: req.user.id,
			status
		})

		await survey.save()

		res.status(200).json(
			SurveyView(survey)
		)
	} catch (err) {
		res.status(500).send(err.message)
	}
})

router.put('/status/:id', authAdmin, async (req, res) => {
	const populate = ['questions', 'createdBy']
	try {
		const status = req.body.status.toUpperCase()

		let survey = await Survey.findById(req.params.id).populate(populate)

		if (status !== 'IDLE' && status !== 'ACTIVE' && status !== 'CLOSED')
			return res.status(400).json({
				message: 'Invalid survey status'
			})
		survey.status = status
		await survey.save()

		res.status(200).json(
			SurveyView(survey, populate)
		)
	} catch (err) {
		res.status(500).send(err)
	}
})


module.exports = router
