const UserView = require('./user')
const QuestionView = require('./question')
const OptionView = require('./option')

module.exports = function SurveyView(survey, arr = []) {
	let populate = {}
	arr.forEach(i => populate[i] = true)

	return ({
		id: survey._id,
		title: survey.title,
		description: survey.description,
		questions: populate.questions ? survey.questions.map(i => QuestionView(i)) : survey.questions,
		status: survey.status,
		options: populate.options ? survey.options.map(i => OptionView(i)): survey.options,
		createdBy: populate.createdBy ? UserView(survey.createdBy) : survey.createdBy,
		createdAt: survey.createdAt,
		deletedAt: survey.deletedAt
	})
}
