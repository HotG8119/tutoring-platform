const { getUser, ensureAuthenticated } = require('../helpers/auth-helpers')

const authenticatedUser = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) {
    if (getUser(req).role === 'user') return next()
    res.redirect('/')
  } else {
    if (getUser(req).role === 'admin') throw new Error('沒有 User 權限!')
    req.flash('error_messages', '請先登入！')
    res.redirect('/signin')
  }
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) {
    if (getUser(req).role === 'admin') return next()
    res.redirect('/admin/')
  } else {
    req.flash('error_messages', '請先登入！')
    res.redirect('/admin/signin')
  }
}

module.exports = {
  authenticatedUser,
  authenticatedAdmin
}
