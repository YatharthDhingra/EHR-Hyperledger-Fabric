const express = require('express')
const router = express.Router()
const {getPatientById,updatePatientPersonalDetails,getPatientHistoryById,getAllDoctors,grantAccessToDoctor,revokeAccessFromDoctor} = require('../controllers/patient.js')

router.route('/patient/:patientId').get(getPatientById)
router.route('/patient/:patientId/details/personal').patch(updatePatientPersonalDetails)
router.route('/patient/:patientId/history').get(getPatientHistoryById)
router.route('/doctors/all').get(getAllDoctors)
router.route('/patient/:patientId/grant/:doctorId').patch(grantAccessToDoctor)
router.route('/patient/:patientId/revoke/:doctorId').patch(revokeAccessFromDoctor)

module.exports  = router