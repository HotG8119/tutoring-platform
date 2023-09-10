const adminService = require('../../services/admin-services')

const adminController = {
  signInPage: (req, res) => {
    return res.render('admin/signin')
  },
  signIn: (req, res, next) => {
    adminService.signIn(req, (error, data) => {
      if (error) return next(error)
      return res.redirect('/admin/users')
    })
  },
  logout: (req, res, next) => {
    adminService.logout(req, (error, data) => {
      if (error) return next(error)
      return res.redirect('/admin/signin')
    })
  },
  getUsers: (req, res, next) => {
    adminService.getUsers(req, (error, data) => {
      if (error) return next(error)
      return res.render('admin/users', data)
    })
  },

  getSearchedUsers: (req, res, next) => {
    adminService.getSearchedUsers(req, (error, data) => {
      if (error) return next(error)
      return res.render('admin/users', data)
    })
  }
}

module.exports = adminController
