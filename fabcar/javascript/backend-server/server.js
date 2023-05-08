const express = require('express')
const app = express()
const loginRoutes = require('./routes/login.js')
const adminRoutes = require('./routes/admin.js')
const patientRoutes = require('./routes/patient.js')
const doctorRoutes = require('./routes/doctor.js')

const authenticationMiddleware = require('./middleware/auth.js')


const PORT = 3000

app.use(express.json()) //to parse json

//Routes
app.use(loginRoutes)
app.use(authenticationMiddleware , adminRoutes)
app.use(authenticationMiddleware , patientRoutes)
app.use(authenticationMiddleware , doctorRoutes)


app.listen(PORT , () => console.log('Server is istening on port 3000...'))



