const { User, TeacherInfo, Class } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const sequelize = require('sequelize')

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
    TeacherInfo.findOne({
      raw: true,
      where: { userId: req.params.id }
    })
      .then(teacherInfo => {
        console.log(teacherInfo)
        if (!teacherInfo) throw new Error('沒有這個老師')
        return res.render('teachers', { teacherInfo })
      })
  }
}

module.exports = classController
