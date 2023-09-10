const { User, TeacherInfo, Class } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
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
        return res.json({ teacherInfos: teacherInfos.rows, pagination: getPagination(limit, page, teacherInfos.count), topLearnUsers })
      })
      .catch(error => next(error))
  }
}

module.exports = classController
