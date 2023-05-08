const express = require('express')
const router = express.Router()
const {createDoctor,createPatient,getAllPatients} = require('../controllers/admin.js')

router.route('/patient/register').post(createPatient)
router.route('/doctor/register').post(createDoctor)
router.route('/patient/all').get(getAllPatients)

module.exports = router