const UserView = require('./user')

module.exports = function ResultViewUser(survey, arr = [], result, qResult) {
	let populate = {}
	arr.forEach(i => populate[i] = true)

	return ({
		id: survey._id,
		title: survey.title,
		description: survey.description,
		questions: qResult,
		Res: result,
		status: survey.status,
		createdBy: populate.createdBy ? UserView(survey.createdBy) : survey.createdBy,
		createdAt: survey.createdAt,
		deletedAt: survey.deletedAt
	})
}
