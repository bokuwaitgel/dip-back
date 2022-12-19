const mongoose = require('mongoose')

const EntrySchema = mongoose.Schema({
	answers: [
		{
			question: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'questions',
			},
			answer: { type: String },
			score: {type: String}
		}
	],
	survey: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'surveys',
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
})

// export model user with UserSchema
module.exports = mongoose.model('entries', EntrySchema)
