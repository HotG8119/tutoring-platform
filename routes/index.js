const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const upload = require('../middleware/multer')
const { authenticatedUser } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

const admin = require('./modules/admin')

router.use('/admin', admin)

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

router.get('/users/:id/becometeacher', authenticatedUser, userController.getBecomeTeacher)
router.post('/users/:id/becometeacher', authenticatedUser, userController.postBecomeTeacher)

router.get('/users/:id/edit', authenticatedUser, userController.editUser)
router.get('/users/:id', authenticatedUser, userController.getUser)
router.put('/users/:id', authenticatedUser, upload.single('image'), userController.putUser)

router.get('/teacher/:id/edit', authenticatedUser, userController.editTeacherInfo)
router.put('/teacher/:id', authenticatedUser, userController.putTeacherInfo)
router.get('/teacher/:id', authenticatedUser, userController.getTeacherInfo)

router.get('/teachers/search', authenticatedUser, classController.getSearchedTeachers)
router.get('/teachers', authenticatedUser, classController.getTeachers)
router.get('/teachers/:id', authenticatedUser, classController.getTeacher)
router.post('/teachers/:id/bookClass', authenticatedUser, classController.bookClass)

router.post('/classes/:id/rate', authenticatedUser, classController.rateClass)

router.use('/', (req, res) => res.redirect('/teachers'))
router.use('/', generalErrorHandler)

module.exports = router
