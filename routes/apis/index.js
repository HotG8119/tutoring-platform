const express = require('express')
const router = express.Router()
const classController = require('../../controllers/apis/class-controller')

router.get('/teachers', classController.getTeachers)

module.exports = router
