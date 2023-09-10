const bcrypt = require('bcryptjs')
const { User, TeacherInfo, Class } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const dayjs = require('dayjs')

const userServices = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('兩次密碼輸入不同！')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('信箱已註冊！')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => {
        return User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          role: 'user'
        })
      })
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        return cb(null)
      })
      .catch(err => cb(err))
  },
  signIn: (req, cb) => {
    req.flash('success_messages', '成功登入！')
    return cb(null)
  },
  logout: (req, cb) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    return cb(null)
  },
  getUser: (req, cb) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) throw new Error('沒有權限！')

    return Promise.all([
      User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        raw: true
      }),
      Class.findAll({
        raw: true,
        nest: true,
        where: { userId },
        order: [['classTime', 'ASC']],
        include: [{
          model: TeacherInfo,
          attributes: ['id', 'userId', 'classLink'],
          include: [{
            model: User,
            attributes: ['name', 'image']
          }]
        }]
      })
    ])
      .then(([user, classes]) => {
        if (!user) throw new Error('找不到使用者！')
        // 找出過去的課程，用day.js讓時間變成 mm-dd hh:mm，將排序改成由新到舊
        const pastClasses = classes.filter(classItem => {
          return new Date(classItem.classTime) < new Date()
        }).map(classItem => {
          classItem.classTime = dayjs(classItem.classTime).format('MM-DD HH:mm')
          return classItem
        }).reverse()
        const futureClasses = classes.filter(classItem => {
          return new Date(classItem.classTime) >= new Date()
        }).map(classItem => {
          classItem.classTime = dayjs(classItem.classTime).format('MM-DD HH:mm')
          return classItem
        })
        return cb(null, { user, pastClasses, futureClasses })
      })
      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { email, emailChecked, name, introduce } = req.body
    if (!email) throw new Error('請輸入信箱！')
    if (email !== emailChecked) throw new Error('兩次輸入的信箱不同！')
    if (!name) throw new Error('請輸入姓名！')
    const { file } = req
    Promise.all([
      User.findByPk(req.params.id, { attributes: { exclude: ['password'] } }),
      imgurFileHandler(file)])
      .then(([user, filePath]) => {
        if (!user) throw new Error('找不到使用者！')
        return user.update({
          email,
          name,
          introduce,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '成功更新個人資料！')
        cb(null)
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
