const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/classes', classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))
router.use('/', generalErrorHandler)

module.exports = router
