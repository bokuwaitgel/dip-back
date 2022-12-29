module.exports = function(option) {
	return ({
		id: option._id,
		score: option.score,
		link: option.link,
		description: option.description
	})
}
