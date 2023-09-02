const { User, TeacherInfo } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const classController = {
  getTeachers: (req, res, next) => {
    const DEFAULT_LIMIT = 6

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return TeacherInfo.findAndCountAll({
      raw: true,
      nest: true,
      include: User,
      limit,
      offset
    })
      .then(teacherInfos => {
        console.log(teacherInfos)
        return res.render('classes', { teacherInfos: teacherInfos.rows, pagination: getPagination(limit, page, teacherInfos.count) })
      })
  }
}

module.exports = classController
