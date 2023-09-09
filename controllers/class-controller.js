const { User, TeacherInfo, Class } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const sequelize = require('sequelize')
const dayjs = require('dayjs')

const CAN_BOOK_DAYS = 14
const CLASS_TIME = {
  START: 18,
  END: 22
}

const classController = {
  getTeachers: (req, res, next) => {
    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return Promise.all([
      TeacherInfo.findAndCountAll({
        raw: true,
        nest: true,
        include: [
          {
            model: User,
            attributes: ['name', 'image']
          }
        ],
        limit,
        offset
      }),
      Class.findAll({ // 取得學習者學習時數前十名
        raw: true,
        nest: true,
        where: { isDone: true },
        attributes: ['userId', [sequelize.fn('SUM', sequelize.col('duration')), 'totalDuration']],
        group: ['userId'],
        order: [[sequelize.fn('SUM', sequelize.col('duration')), 'DESC']],
        limit: 10,
        include: [
          {
            model: User,
            attributes: ['name']
          }
        ]
      })
    ])
      .then(([teacherInfos, topLearnUsers]) => {
        return res.render('classes', { teacherInfos: teacherInfos.rows, pagination: getPagination(limit, page, teacherInfos.count), topLearnUsers })
      })
      .catch(error => next(error))
  },
  getSearchedTeachers: (req, res, next) => {
    const keyword = req.query.keyword.replace(/[^a-zA-Z0-9]/g, '').trim()

    return Promise.all([
      TeacherInfo.findAll({
        raw: true,
        nest: true,
        include: [
          {
            model: User,
            attributes: ['name', 'image']
          }
        ]
      }),
      Class.findAll({ // 取得學習者學習時數前十名
        raw: true,
        nest: true,
        where: { isDone: true },
        attributes: ['userId', [sequelize.fn('SUM', sequelize.col('duration')), 'totalDuration']],
        group: ['userId'],
        order: [[sequelize.fn('SUM', sequelize.col('duration')), 'DESC']],
        limit: 10,
        include: [
          {
            model: User,
            attributes: ['name']
          }
        ]
      })
    ])
      .then(([teacherInfos, topLearnUsers]) => {
        const teacherInfosLowerCase = teacherInfos.map(teacherInfo => {
          return {
            ...teacherInfo,
            method: teacherInfo.method.toLowerCase(),
            name: teacherInfo.User.name.toLowerCase()
          }
        })
        // 篩選出符合搜尋條件的老師
        const searchedTeacherInfos = teacherInfosLowerCase.filter(teacherInfo => {
          return teacherInfo.classIntroduce.includes(keyword) || teacherInfo.name.includes(keyword)
        })
        if (searchedTeacherInfos.length === 0) {
          req.flash('error_messages', '沒有符合搜尋條件的老師')
          return res.redirect('/teachers')
        }

        return res.render('classes', { teacherInfos: searchedTeacherInfos, keyword, topLearnUsers })
      })
      .catch(error => next(error))
  },
  getTeacher: (req, res, next) => {
    const teacherInfoId = req.params.id

    return Promise.all([
      TeacherInfo.findByPk(teacherInfoId, {
        raw: true,
        nest: true,
        include: [
          { model: User, attributes: ['name', 'image'] }
        ]
      }),
      Class.findAll({
        raw: true,
        nest: true,
        where: { teacherInfoId: teacherInfoId },
        order: [['classTime', 'DESC']]
      })
    ])
      .then(([teacherInfo, classes]) => {
        if (!teacherInfo) throw new Error('沒有這個老師')
        // 拿到已評價的class
        const ratedClasses = classes.filter(classData => classData.rate > 0)

        // 拿到兩週內可以預約的時間
        let availableWeekdays = teacherInfo.availableWeekdays ? JSON.parse(teacherInfo.availableWeekdays) : null
        if (!availableWeekdays) {
          return res.render('teachers', { teacherInfo, ratedClasses, availableTimesAfterBooked: ['目前沒有可預約的課程'] })
        }
        if (!Array.isArray(availableWeekdays)) { availableWeekdays = [availableWeekdays] }
        availableWeekdays = availableWeekdays.map(day => Number(day))
        // // 拿到老師的duration
        const duration = Number(teacherInfo.duration)
        // // 拿到未來已預約課程的時間 用day.js讓時間變成 mm-dd hh:mm
        const bookedClassesTime = classes.filter(classData => classData.classTime > Date.now()).map(classData => dayjs(classData.classTime).format('YYYY-MM-DD HH:mm'))
        // // 以availableWeekdays拿到未來兩週可以預約的18:00~22:00的時間 以duration為單位
        const availableTimes = []
        const todayWeekday = dayjs().day()
        for (let day = 0; day < CAN_BOOK_DAYS; day++) {
          const weekday = (todayWeekday + day) % 7
          if (availableWeekdays.includes(weekday)) {
            for (let j = CLASS_TIME.START; j < CLASS_TIME.END; j++) {
              if (duration === 30) {
                availableTimes.push(dayjs().add(day, 'day').hour(j).minute(0).format('YYYY-MM-DD HH:mm'))
                availableTimes.push(dayjs().add(day, 'day').hour(j).minute(30).format('YYYY-MM-DD HH:mm'))
              }
              if (duration === 60) {
                availableTimes.push(dayjs().add(day, 'day').hour(j).minute(0).format('YYYY-MM-DD HH:mm'))
              }
            }
          }
        }
        // // 用availableTimes扣去bookedClassesTime
        const availableTimesAfterBooked = availableTimes.filter(availableTime => !bookedClassesTime.includes(availableTime))

        // 計算老師的平均評價
        const rates = classes.map(classData => classData.rate).filter(rate => rate > 0)
        // 將所有rate加總
        const sumRate = rates.reduce((a, b) => a + b, 0)
        // 計算平均 取到小數點第一位
        const avgRate = (sumRate / rates.length).toFixed(1)

        return res.render('teachers', { teacherInfo, ratedClasses, availableTimesAfterBooked, avgRate })
      })
      .catch(error => next(error))
  },
  rateClass: (req, res, next) => {
    const id = req.params.id
    const { rate, message } = req.body
    if (!rate) throw new Error('請填寫評分！')

    Class.findByPk(id)
      .then(classData => {
        if (!classData) throw new Error('沒有這個課程')

        return classData.update({
          rate,
          message
        })
      })
      .then(() => {
        req.flash('success_messages', '評價成功！')
        res.redirect(`/users/${req.user.id}`)
      })
      .catch(error => next(error))
  },
  bookClass: (req, res, next) => {
    const teacherInfoId = req.params.id
    const userId = req.user.id
    const { bookDate } = req.body
    if (!dayjs(bookDate).isValid()) throw new Error('請選擇日期！')

    return Promise.all([
      TeacherInfo.findByPk(teacherInfoId, { raw: true }),
      Class.findOne({
        where: {
          classTime: bookDate,
          teacherInfoId
        }
      })
    ])
      .then(([teacherInfo, classes]) => {
        if (teacherInfo.userId === userId) {
          req.flash('error_messages', '不能預約自己的課程！')
          return res.redirect(`/teachers/${teacherInfoId}`)
        }
        console.log(classes)
        if (classes) {
          req.flash('error_messages', '這個時段已經被預約了！')
          return res.redirect(`/teachers/${teacherInfoId}`)
        }

        return Class.create({
          classTime: bookDate,
          teacherInfoId,
          userId
        })
      })
      .catch(error => next(error))
  }
}

module.exports = classController
