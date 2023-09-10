const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (error, data) => {
      if (error) return next(error)
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    userServices.signIn(req, (error, data) => {
      if (error) return next(error)
      return res.redirect('/teachers')
    })
  },
  logout: (req, res, next) => {
    userServices.logout(req, (error, data) => {
      if (error) return next(error)
      return res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (error, data) => {
      if (error) return next(error)
      return res.render('users/profile', data)
    })
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (error, data) => {
      if (error) return next(error)
      return res.render('users/edit-profile', data)
    })
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (error, data) => {
      if (error) return next(error)
      return res.redirect(`/users/${req.params.id}`)
    })
  }
}

module.exports = userController
