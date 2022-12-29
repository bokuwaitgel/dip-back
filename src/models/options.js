const mongoose = require('mongoose')

const OptionSchema = mongoose.Schema({
	score: {
		type: String,
		required: true
	},
	link: 
		{ type: String }
	,
	description: 
		{ type: String }
	
})

// export model user with UserSchema
module.exports = mongoose.model('options', OptionSchema)
