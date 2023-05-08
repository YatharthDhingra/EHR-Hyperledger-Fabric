const express = require('express')
const router = express.Router()

const {updatePatientMedicalDetails,getDoctorById} = require('../controllers/doctor.js')

router.route('/patient/:patientId/details/medical').patch(updatePatientMedicalDetails)
router.route('/doctor/:docId').get(getDoctorById)
