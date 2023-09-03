const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const upload = require('../middleware/multer')
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

router.get('/users/:id/becometeacher', authenticated, userController.getBecomeTeacher)
router.post('/users/:id/becometeacher', authenticated, userController.postBecomeTeacher)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/teacher/:id/edit', authenticated, userController.editTeacher)
router.put('/teacher/:id', authenticated, userController.putTeacher)
router.get('/teacher/:id', authenticated, userController.getTeacher)

router.get('/teachers/:id', authenticated, classController.getTeacher)
router.get('/teachers/search', authenticated, classController.getSearchedTeachers)
router.get('/teachers', authenticated, classController.getTeachers)

router.use('/', (req, res) => res.redirect('/teachers'))
router.use('/', generalErrorHandler)

module.exports = router
