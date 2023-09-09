const { getUser, ensureAuthenticated } = require('../helpers/auth-helpers')

const authenticatedUser = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req) && getUser(req).role === 'user') {
    return next()
  } else {
    req.flash('error_messages', '請先登入！')
    res.redirect('/signin')
  }
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req) && getUser(req).role === 'admin') {
    return next()
  } else {
    req.flash('error_messages', '請先登入！')
    res.redirect('/admin/signin')
  }
}

module.exports = {
  authenticatedUser,
  authenticatedAdmin
}
