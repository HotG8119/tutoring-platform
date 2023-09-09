const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcryptjs')
const { User, Admin } = require('../models')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    User.findOne({
      where: { email },
      raw: true
    })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))

        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          return cb(null, user)
        })
      })
      .catch(err => cb(err, false))
  }
))

passport.use('admin', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    Admin.findOne({
      where: { email },
      raw: true
    })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))

        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          return cb(null, user)
        })
      })
      .catch(err => cb(err, false))
  }
))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    profileFields: ['email', 'displayName']
  },
  (accessToken, refreshToken, profile, cb) => {
    const { name, email } = profile._json
    User.findOne({ where: { email } })
      .then(user => {
        if (user) return cb(null, user)
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => User.create({
            name,
            email,
            password: hash
          }))
          .then(user => {
            return cb(null, user)
          })
          .catch(err => cb(err, false))
      })
  }))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id)
    .then(user => {
      if (user) {
        user = user.toJSON()
        return cb(null, user)
      }
    })
  Admin.findByPk(id)
    .then(admin => {
      if (admin) {
        admin = admin.toJSON()
        return cb(null, admin)
      }
    })
})

module.exports = passport
