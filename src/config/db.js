const mongoose = require('mongoose')

const MONGOURI =  "mongodb://127.0.0.1:27017"

const InitiateMongoServer = () => {
	mongoose.set('strictQuery', false);
	mongoose.connect(MONGOURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(() => {
		console.log('connected to mongodb!')
	}).catch(() => {
		console.log('error connecting to db')
	})
}

module.exports = InitiateMongoServer
