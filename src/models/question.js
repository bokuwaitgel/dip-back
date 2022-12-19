const mongoose = require('mongoose')

const QuestionSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	options: [
		{ type: String }
	],
	createdAt: [
		{ type: String }
	],
})

// export model user with UserSchema
module.exports = mongoose.model('questions', QuestionSchema)
