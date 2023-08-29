const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/signin'
  })
)
router.get('/logout', userController.logout)

router.get('/classes', authenticated, classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))
router.use('/', generalErrorHandler)

module.exports = router
