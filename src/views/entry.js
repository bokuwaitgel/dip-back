const UserView = require('./user')
const QuestionView = require('./question')
const SurveyView = require('./survey')

module.exports = function EntryView(entry, arr = []) {
	let populate = {}
	arr.forEach(i => populate[i] = true)

	return ({
		id: entry._id,
		answers: entry.answers.map(i => ({
			question: populate.question ? QuestionView(i.question) : i.question,
			answer: i.answer
		})),
		survey: populate.survey ? SurveyView(entry.survey) : entry.survey,
		user: populate.user && entry.user ? UserView(entry.user) : entry.user,
		createdAt: entry.createdAt
	})
}
