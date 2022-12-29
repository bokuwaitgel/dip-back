const mongoose = require('mongoose')

const SurveySchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	type: { 
		type: String
		// required: true
	},
	description: {
		type: String
	},
	questions: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'questions' }
	],
	resultTilte: {
		type: String
	},
	options : [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'options' }
	],
	status: {
		type: String,
		required: true,
		default: 'IDLE'
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	deletedAt: {
		type: Date,
		default: null
	}
})

// export model user with UserSchema
module.exports = mongoose.model('survey', SurveySchema)
