const mongoose = require('mongoose')

const ResultSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	options: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'options' }
	],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
})

// export model user with UserSchema
module.exports = mongoose.model('result', ResultSchema)
