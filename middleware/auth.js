const { getUser, ensureAuthenticated } = require('../helpers/auth-helpers')

const authenticatedUser = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) throw new Error('沒有 User 權限!')
    if (getUser(req).isUser) return next()
    res.redirect('/')
  } else {
    req.flash('error_messages', '請先登入！')
    res.redirect('/signin')
  }
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) {
    if (getUser(req).isUser) throw new Error('沒有 Admin 權限!')
    if (getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    req.flash('error_messages', '請先登入！')
    res.redirect('/signin')
  }
}

module.exports = {
  authenticatedUser,
  authenticatedAdmin
}
