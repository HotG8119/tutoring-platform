const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')

const adminController = require('../../controllers/admin-controller')
const { authenticatedAdmin } = require('../../middleware/auth')

router.get('/signin', adminController.signInPage)
router.post('/signin', passport.authenticate('admin', { failureRedirect: '/admin/signin', failureFlash: true }), adminController.signIn)
router.get('/logout', adminController.logout)

router.get('/users/search', authenticatedAdmin, adminController.getSearchedUsers)
router.get('/users', authenticatedAdmin, adminController.getUsers)

router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
