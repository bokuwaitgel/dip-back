const UserView = require('./user')

module.exports = function ResultView(survey, arr = [], result) {
	let populate = {}
	arr.forEach(i => populate[i] = true)

	return ({
		id: survey._id,
		title: survey.title,
		description: survey.description,
		questions: result,
		status: survey.status,
		createdBy: populate.createdBy ? UserView(survey.createdBy) : survey.createdBy,
		createdAt: survey.createdAt,
		deletedAt: survey.deletedAt
	})
}
