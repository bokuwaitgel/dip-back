const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const user = require('./routes/user') //new addition
const survey = require('./routes/survey') //new addition
const entry = require('./routes/entry') //new addition
const resultSur = require('./routes/result') //new addition

const InitiateMongoServer = require('./config/db')

const app = express()
app.use(cors())

// PORT
const PORT = process.env.PORT || 4000 // eslint-disable-line

// Middleware
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.json({ message: 'API Working' })
})

app.use('/users', user)
app.use('/surveys', survey)
app.use('/entries', entry)
app.use('/result', resultSur)

app.listen(PORT, () => {
	console.log(`Server Started at PORT ${PORT}`)
	InitiateMongoServer()
})
