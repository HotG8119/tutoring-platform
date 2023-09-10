const { User, TeacherInfo, Class } = require('../models')
const dayjs = require('dayjs')

const teacherServices = {
  getBecomeTeacher: (req, cb) => {
    const userId = req.user.id
    Promise.all([
      User.findByPk(userId,
        { attributes: { exclude: ['password'] }, raw: true }),
      TeacherInfo.findOne({ where: { userId }, raw: true })
    ])
      .then(([user, teacherInfo]) => {
        if (!user) throw new Error('找不到使用者！')
        if (teacherInfo) throw new Error('已經是老師！')

        return cb(null)
      })
      .catch(err => cb(err))
  },
  postBecomeTeacher: (req, cb) => {
    const { classIntroduce, method, duration, availableWeekdays, classLink } = req.body
    const userId = req.user.id
    const availableWeekdaysString = JSON.stringify(availableWeekdays)
    if (!classIntroduce || !method || !classLink) throw new Error('請填寫所有欄位！')

    User.findByPk(userId, { attributes: { exclude: ['password'] } })
      .then(user => {
        if (!user) throw new Error('找不到使用者！')
        return user.update({ isTeacher: true })
      })
      .then(() => {
        TeacherInfo.create({
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
        return cb(null)
      })
      .catch(err => cb(err))
  },
  getTeacherInfo: (req, cb) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) throw new Error('沒有權限！')

    User.findByPk(userId, {
      raw: true,
      nest: true,
      exclude: ['password'],
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
            return cb(null, { user, futureClasses, ratedClasses })
          })
      })
      .catch(err => cb(err))
  },
  editTeacherInfo: (req, cb) => {
    const userId = req.user.id
    if (userId !== Number(req.params.id)) throw new Error('沒有權限！')

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
          return cb(null, { teacherInfo, weekdays })
        }
        return cb(null, { teacherInfo })
      })
      .catch(err => cb(err))
  },
  putTeacherInfo: (req, cb) => {
    const { classIntroduce, method, duration, classLink } = req.body
    const userId = req.user.id
    const availableWeekdaysString = req.body.availableWeekdays ? JSON.stringify(req.body.availableWeekdays) : null
    if (userId !== Number(req.params.id)) throw new Error('沒有權限！！')
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
        return cb(null)
      })
      .catch(err => cb(err))
  }
}

module.exports = teacherServices
