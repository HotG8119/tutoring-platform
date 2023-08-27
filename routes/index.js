const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const classController = require('../controllers/class-controller')

router.use('/admin', admin)

router.get('/classes', classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))

module.exports = router
