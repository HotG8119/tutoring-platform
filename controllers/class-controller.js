const { User, TeacherInfo, Class } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const sequelize = require('sequelize')

const dayjs = require('dayjs')

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
        console.log(topLearnUsers)
        return res.render('classes', { teacherInfos: teacherInfos.rows, pagination: getPagination(limit, page, teacherInfos.count), topLearnUsers })
      })
      .catch(error => next(error))
  },
  getSearchedTeachers: (req, res, next) => {
    const keyword = req.query.keyword.replace(/[^a-zA-Z0-9]/g, '').trim()

    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return TeacherInfo.findAndCountAll({
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
    })
      .then(teacherInfos => {
        // 讓teacherInfos.rows 全都變成小寫
        const teacherInfosLowerCase = teacherInfos.rows.map(teacherInfo => {
          return {
            ...teacherInfo,
            method: teacherInfo.method.toLowerCase(),
            name: teacherInfo.User.name.toLowerCase()
          }
        })
        // 篩選出符合搜尋條件的老師
        const searchedTeacherInfos = teacherInfosLowerCase.filter(teacherInfo => {
          return teacherInfo.method.includes(keyword) || teacherInfo.name.includes(keyword)
        })

        if (searchedTeacherInfos.length === 0) {
          req.flash('error_messages', '沒有符合搜尋條件的老師')
          return res.redirect('/teachers')
        }

        return res.render('classes', { teacherInfos: searchedTeacherInfos, pagination: getPagination(limit, page, teacherInfos.count), keyword })
      })
      .catch(error => next(error))
  }
}

module.exports = classController
