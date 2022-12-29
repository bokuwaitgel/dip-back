module.exports = function(question) {
	return ({
		id: question._id,
		title: question.title,
		options: question.options,
		link: question.link,
		createdAt: question.createdAt
	})
}
