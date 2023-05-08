const express = require('express')
const router = express.Router()
const {login} = require('../controllers/login.js')

router.route('/login').post(login)

module.exports = router