const express = require('express')
const router = express.Router()

const classController = require('../controllers/class-controller')

router.get('/classes', classController.getClass)

router.use('/', (req, res) => res.redirect('/classes'))

module.exports = router
