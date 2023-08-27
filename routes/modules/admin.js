const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

router.get('/classes', adminController.getClasses)

router.use('/', (req, res) => res.redirect('/admin/classes'))

module.exports = router
