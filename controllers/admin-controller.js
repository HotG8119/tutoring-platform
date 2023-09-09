const { User, TeacherInfo } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const dayjs = require('dayjs')

const adminController = {
  signInPage: (req, res) => {
    return res.render('admin/signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/admin/users')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/admin/signin')
  },
  getUsers: (req, res) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    User.findAndCountAll({
      raw: true,
      nest: true,
      attributes: { exclude: ['password'] },
      include: {
        model: TeacherInfo,
        attributes: ['id', 'classIntroduce', 'method', 'availableWeekdays']
      },
      limit,
      offset
    }).then(users => {
      const result = users.rows.map(user => ({
        ...user,
        createdAt: dayjs(user.createdAt).format('YYYY-MM-DD'),
        // 將availableWeekdays解析並排序
        availableWeekdays: user.TeacherInfo.availableWeekdays
          ? JSON.parse(user.TeacherInfo.availableWeekdays).sort((a, b) => a - b)
          : null
      }))
      return res.render('admin/users', { result, pagination: getPagination(limit, page, users.count) })
    })
  }
}

module.exports = adminController
