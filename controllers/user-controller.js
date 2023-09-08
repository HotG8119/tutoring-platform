const bcrypt = require('bcryptjs')
const { User, TeacherInfo, Class } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const dayjs = require('dayjs')

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
    res.redirect('/teachers')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) {
      req.flash('error_messages', '沒有權限！')
      return res.redirect('/teachers')
    }

    return Promise.all([
      User.findByPk(userId, { raw: true }),
      Class.findAll({
        raw: true,
        nest: true,
        where: { userId },
        order: [['classTime', 'ASC']],
        include: [
          {
            model: TeacherInfo,
            attributes: ['id', 'userId', 'classLink'],
            include: [
              {
                model: User,
                attributes: ['name', 'image']
              }
            ]
          }
        ]
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
        // console.log('classes', classes)
        // console.log('futureClasses', futureClasses)
        console.log('pastClasses', pastClasses)
        return res.render('users/profile', { user, futureClasses, pastClasses })
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

        return res.render('users/become-teacher')
      })
      .catch(err => next(err))
  },
  postBecomeTeacher: (req, res, next) => {
    const { classIntroduce, method, duration, availableWeekdays, classLink } = req.body
    const userId = req.user.id
    const availableWeekdaysString = JSON.stringify(availableWeekdays)
    if (!classIntroduce || !method || !classLink) throw new Error('請填寫所有欄位！')

    return Promise.all([
      User.findByPk(userId),
      TeacherInfo.create({
        classIntroduce,
        method,
        duration,
        availableWeekdays: availableWeekdaysString,
        classLink,
        userId
      })
    ])
      .then(([user, teacherInfo]) => {
        if (!user) throw new Error('找不到使用者！')
        return user.update({ isTeacher: true })
      })
      .then(() => {
        req.flash('success_messages', '成功提出申請！')
        res.redirect('/')
      })
      .catch(err => next(err))
  },
  getTeacherInfo: (req, res, next) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) {
      req.flash('error_messages', '沒有權限！')
      return res.redirect('/teachers')
    }

    User.findByPk(userId, {
      raw: true,
      nest: true,
      include: [
        { model: TeacherInfo }
      ]
    })
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        // 用user.TeacherInfo.id去找Class,並照時間排列, 並用user_id去找User的名字
        Class.findAll({
          raw: true,
          nest: true,
          where: { teacherInfoId: user.TeacherInfo.id },
          order: [['classTime', 'ASC']],
          include: [
            { model: User, attributes: ['name'] }
          ]
        })
          .then(classes => {
          // 找出未來的class，用day.js讓時間變成 mm-dd hh:mm
            const futureClasses = classes.filter(classItem => {
              return new Date(classItem.classTime) > new Date()
            }).map(classItem => {
              classItem.classTime = dayjs(classItem.classTime).format('MM-DD HH:mm')
              return classItem
            })

            // 找出最新 6 筆已評價過的class
            const ratedClasses = classes.filter(classItem => {
              return classItem.rate !== null
            }).slice(-6)
            return res.render('users/teacher', { user, futureClasses, ratedClasses })
          })
      })
      .catch(err => next(err))
  },
  editTeacherInfo: (req, res, next) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) {
      req.flash('error_messages', '沒有權限！')
      return res.redirect('/teachers')
    }

    TeacherInfo.findOne({ where: { userId }, raw: true })
      .then(teacherInfo => {
        if (!teacherInfo) throw new Error('找不到老師資料！')
        if (teacherInfo.availableWeekdays) {
          teacherInfo.availableWeekdays = JSON.parse(teacherInfo.availableWeekdays)
          const weekdays = [
            { value: '1', label: '星期一', checked: teacherInfo.availableWeekdays.includes('1') },
            { value: '2', label: '星期二', checked: teacherInfo.availableWeekdays.includes('2') },
            { value: '3', label: '星期三', checked: teacherInfo.availableWeekdays.includes('3') },
            { value: '4', label: '星期四', checked: teacherInfo.availableWeekdays.includes('4') },
            { value: '5', label: '星期五', checked: teacherInfo.availableWeekdays.includes('5') },
            { value: '6', label: '星期六', checked: teacherInfo.availableWeekdays.includes('6') },
            { value: '7', label: '星期日', checked: teacherInfo.availableWeekdays.includes('7') }
          ]
          return res.render('users/edit-teacher', { teacherInfo, weekdays })
        }
        return res.render('users/edit-teacher', { teacherInfo })
      })
      .catch(err => next(err))
  },
  putTeacherInfo: (req, res, next) => {
    const { classIntroduce, method, duration, classLink } = req.body
    const userId = req.user.id
    const availableWeekdaysString = req.body.availableWeekdays ? JSON.stringify(req.body.availableWeekdays) : null
    if (userId !== Number(req.params.id)) {
      req.flash('error_messages', '沒有權限！！')
      return res.redirect('/teachers')
    }
    if (!classIntroduce || !method || !classLink) throw new Error('請填寫所有欄位！')

    TeacherInfo.findOne({ where: { userId } })
      .then(teacherInfo => {
        if (!teacherInfo) throw new Error('找不到老師資料！')
        return teacherInfo.update({
          classIntroduce,
          method,
          duration,
          availableWeekdays: availableWeekdaysString,
          classLink
        })
      })
      .then(() => {
        req.flash('success_messages', '成功更新課程資訊與時間！')
        res.redirect(`/teacher/${userId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = userController
