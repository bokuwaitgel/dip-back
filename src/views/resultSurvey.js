const UserView = require('./user')
const OptionView = require('./option')

module.exports = function ResultSurveyView(survey, arr = []) {
	let populate = {}
	arr.forEach(i => populate[i] = true)

	return ({
		id: survey._id,
		title: survey.title,
		options: populate.options ? survey.options.map(i => OptionView(i)) : survey.options,
		createdBy: populate.createdBy ? UserView(survey.createdBy) : survey.createdBy,
		createdAt: survey.createdAt
	})
}
