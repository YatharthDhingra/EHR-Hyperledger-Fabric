const express = require('express')
const app = express()
const loginRoutes = require('./routes/login.js')
const adminRoutes = require('./routes/admin.js')
const patientRoutes = require('./routes/patient.js')
const doctorRoutes = require('./routes/doctor.js')

require('dotenv').config();
const connectDB = require('../db/connect.js');

const authenticationMiddleware = require('./middleware/auth.js')

const PORT = 3000

app.use(express.json()) //to parse json

//Routes
app.use(loginRoutes)
app.use(adminRoutes)
app.use(authenticationMiddleware , patientRoutes)
app.use(authenticationMiddleware , doctorRoutes)


const start = async () => {
    try {
      // connectDB
      await connectDB(process.env.MONGO_URL);
      app.listen(PORT, () => console.log(`Server is listening port ${PORT}...`));
    } catch (error) {
      console.log(error);
    }
}
  
start();



