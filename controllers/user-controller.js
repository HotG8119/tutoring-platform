const bcrypt = require('bcryptjs')
const { User, TeacherInfo } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('兩次密碼輸入不同！')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('信箱已註冊！')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/classes')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        return res.render('users/profile', { user: user.toJSON() })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        return res.render('users/edit-profile', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name, introduce } = req.body
    if (!name) throw new Error('請輸入姓名！')
    const { file } = req
    Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)])
      .then(([user, filePath]) => {
        if (!user) throw new Error('找不到使用者！')
        return user.update({
          name,
          introduce,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '成功更新個人資料！')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  getBecomeTeacher: (req, res, next) => {
    const userId = req.user.id
    Promise.all([
      User.findByPk(userId, { raw: true }),
      TeacherInfo.findOne({ where: { userId }, raw: true })
    ])
      .then(([user, teacherInfo]) => {
        if (!user) throw new Error('找不到使用者！')
        if (teacherInfo) throw new Error('已經是老師！')

        res.render('users/become-teacher')
        console.log(teacherInfo)
      })
      .catch(err => next(err))
  },
  postBecomeTeacher: (req, res, next) => {
    const { classIntroduce, method, duration, availableWeekdays, classLink } = req.body
    const userId = req.user.id
    const availableWeekdaysString = JSON.stringify(availableWeekdays)
    if (!classIntroduce || !method || !classLink) throw new Error('請填寫所有欄位！')

    User.findByPk(userId)
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        return TeacherInfo.create({
          classIntroduce,
          method,
          duration,
          availableWeekdays: availableWeekdaysString,
          classLink,
          userId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功提出申請！')
        res.redirect('/')
      })
      .catch(err => next(err))
  }
}

module.exports = userController
