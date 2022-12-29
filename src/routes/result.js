const express = require('express')
const router = express.Router()
const { auth, authAdmin, setRequestUser } = require('../middleware/auth')
const { retakingUser } = require('../utils/validation')

const Survey = require('../models/survey')
const Question = require('../models/question')
const Entry = require('../models/entry')
const User = require('../models/user')
const Result = require('../models/result')
const Options = require('../models/options')

const SurveyView = require('../views/survey')
const EntryView = require('../views/entry')
const ResultSurveyView = require('../views/resultSurvey')
const OptionView = require('../views/option')


router.get('/', authAdmin, async (req, res) => {
    const populate = ['options']
    try {
		const result = await Result.find({}).populate(populate)

		res.status(200).json(
			result.map(i => ResultSurveyView(i))
		)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/option', authAdmin, async (req, res) => {
    const populate = ['options']
    try {
		const result = await Result.find({})

		res.status(200).json(
			result.map(i => ResultSurveyView(i))
		)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})
router.post('/', authAdmin, async (req, res) => {
	const { title, options} = req.body
	try {
		if (!title)
			return res.status(400).json({
				message: 'Please enter a title for your survey'
			})
		let optionsRef = await Options.insertMany(options)

		let result = new Result({
			title,
			options: optionsRef.map(i => i.id),
			createdBy: req.user.id,
		})

		await result.save()

		res.status(200).json(
		    ResultSurveyView(result)
		)
	} catch (err) {
		res.status(500).send(err.message)
	}
})
router.put('/edit/:id', authAdmin, async (req, res) => {
    const populate = ['options']
	const { title, options} = req.body
    const id = req.params.id
    try {
		const id = req.params.id
		const survey = await Result.findById(id).populate(populate)
        await options.forEach(async (item) => {
            		if(item?.id){
            			Options.findByIdAndDelete(item.id).then(data => {
            				console.log(data)
            			})
            		}})
        console.log(survey)
		if (!title)
			return res.status(400).json({
				message: 'Please enter a title for your survey'
			})
		let optionsRef = await Options.insertMany(options)

		survey.title = title
		survey.questions = optionsRef.map(i => i.id)
		survey.createdBy = req.user.id

		await survey.save()

		res.status(200).json(
		    ResultSurveyView(survey, populate)
		)
    }catch (err) {
        res.status(500).send(err.message)
    } 
    // const survey = await Result.findById(id).populate(populate)s
    // console.log(survey)
    // console.log(title)
	// try {
    //    
    //     await options.forEach(async (item) => {
	// 		if(item?.id){
	// 			Options.findByIdAndDelete(item.id).then(data => {
	// 				console.log(data)
	// 			})
	// 		}
	// 	})
	// 	if (!title)
	// 		return res.status(400).json({
	// 			message: 'Please enter a title for your survey'
	// 		})
	// 	let optionsRef = await Options.insertMany(options)

	// 	survey.title = title
	// 	survey.questions = optionsRef.map(i => i.id)
	// 	survey.createdBy = req.user.id

	// 	await survey.save()

	// 	res.status(200).json(
	// 	    ResultSurveyView(survey, populate)
	// 	)
	// } catch (err) {
	// 	res.status(500).send(err.message)
	// }
})
router.delete('/delete/:id', authAdmin, async (req, res) => {
	const populate = ['options', 'createdBy']
	try {
		const id = req.params.id
		const survey = await Result.findById(id).populate(populate)
        console.log(survey)
		let result = survey.options.map(i => OptionView(i))
		await result.forEach(async (item) => {
			Options.findByIdAndDelete(item.id).then(data => {
				if(!data){
					console.log('failed')
				}else{
                    console.log(data)
					console.log('succ')
				}
			})
		})
		Result.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                res.send({
                    message : "Survey was deleted successfully!"
                })
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Survey with id=" + id
            });
        });
	} catch (err) {
		res.status(500).send(err)
	}
})
module.exports = router