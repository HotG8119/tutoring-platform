const { User, TeacherInfo, Class } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const sequelize = require('sequelize')
const dayjs = require('dayjs')

const CAN_BOOK_DAYS = 14
const CLASS_TIME = {
  START: 18,
  END: 22
}

const classService = {
  getTeachers: (req, cb) => {
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
        return cb(null, { teacherInfos: teacherInfos.rows, pagination: getPagination(limit, page, teacherInfos.count), topLearnUsers })
      })
      .catch(error => cb(error))
  },
  getSearchedTeachers: (req, cb) => {
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

        // 沒有符合搜尋條件的老師 跳出錯誤訊息 並把keyword帶回到classes頁面
        if (searchedTeacherInfos.length === 0) throw new Error(`關鍵字 ${keyword} 沒有符合條件的老師`)

        return cb(null, { teacherInfos: searchedTeacherInfos, keyword, topLearnUsers })
      })
      .catch(error => cb(error))
  },
  getTeacher: (req, cb) => {
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
        // 拿到已評價的class，並依照rate排序，取前兩個最高分和最低分
        const ratedClasses = classes.filter(classData => classData.rate > 0)
        const topRatedClasses = ratedClasses.sort((a, b) => b.rate - a.rate).slice(0, 2)
        const lowRatedClasses = ratedClasses.sort((a, b) => a.rate - b.rate).slice(0, 2)

        // 拿到兩週內可以預約的時間
        let availableWeekdays = teacherInfo.availableWeekdays ? JSON.parse(teacherInfo.availableWeekdays) : null
        if (!availableWeekdays) {
          return cb(null, { teacherInfo, ratedClasses, availableTimesAfterBooked: ['目前沒有可預約的課程'] })
        //   return res.render('teachers', { teacherInfo, ratedClasses, availableTimesAfterBooked: ['目前沒有可預約的課程'] })
        }
        if (!Array.isArray(availableWeekdays)) { availableWeekdays = [availableWeekdays] }
        // // 將availableWeekdays轉成數字並排序
        availableWeekdays = availableWeekdays.map(day => Number(day)).sort((a, b) => a - b)
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

        // 拿到老師的平均評價
        let avgRate = 0
        const rates = classes.map(classData => classData.rate).filter(rate => rate > 0)
        const sumRate = rates.reduce((a, b) => a + b, 0)
        avgRate = (sumRate / rates.length).toFixed(1)

        return cb(null, { teacherInfo, topRatedClasses, lowRatedClasses, availableWeekdays, availableTimesAfterBooked, avgRate })
        // return res.render('teachers', { teacherInfo, topRatedClasses, lowRatedClasses, availableWeekdays, availableTimesAfterBooked, avgRate })
      })
      .catch(error => cb(error))
  },
  rateClass: (req, cb) => {
    const id = req.params.id
    const userId = req.user.id
    const { rate, message } = req.body
    if (!rate) throw new Error('請選擇評分！')

    Class.findByPk(id)
      .then(classData => {
        if (!classData) throw new Error('沒有這個課程')
        if (classData.userId !== userId) throw new Error('沒有權限評價這個課程')
        if (classData.classTime > Date.now()) throw new Error('課程還沒結束，無法評價！')

        return classData.update({
          rate,
          message
        })
      })
      .then(() => {
        req.flash('success_messages', '評價成功！')
        return cb(null)
      })
      .catch(error => cb(error))
  },
  bookClass: (req, cb) => {
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
        if (teacherInfo.userId === userId) throw new Error('不能預約自己的課程！')
        if (classes) throw new Error('這個時段已經被預約了！')

        return Class.create({
          classTime: bookDate,
          teacherInfoId,
          userId
        })
      })
      .then(() => {
        req.flash('success_messages', '預約成功！')
      })
      .catch(error => cb(error))
  }
}

module.exports = classService
