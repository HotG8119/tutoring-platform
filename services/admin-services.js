const { User, TeacherInfo } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const dayjs = require('dayjs')

const adminService = {
  signIn: (req, cb) => {
    req.flash('success_messages', '成功登入！')
    cb(null)
  },
  logout: (req, cb) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    cb(null)
  },
  getUsers: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    User.findAndCountAll({
      raw: true,
      nest: true,
      attributes: { exclude: ['password'] },
      where: { role: 'user' },
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
      return cb(null, { result, pagination: getPagination(limit, page, users.count) })
    })
      .catch(error => cb(error))
  },
  getSearchedUsers: (req, cb) => {
    const keyword = req.query.keyword.replace(/[^a-zA-Z0-9]/g, '').trim()

    User.findAll({
      raw: true,
      nest: true,
      attributes: { exclude: ['password'] },
      where: { role: 'user' },
      include: {
        model: TeacherInfo,
        attributes: ['id', 'classIntroduce', 'method', 'availableWeekdays']
      }
    }).then(users => {
      const result = users.map(user => {
        return {
          ...user,
          name: user.name.toLowerCase(),
          introduce: user.introduce ? user.introduce.toLowerCase() : null,
          createdAt: dayjs(user.createdAt).format('YYYY-MM-DD'),
          // 將availableWeekdays解析並排序
          availableWeekdays: user.TeacherInfo.availableWeekdays
            ? JSON.parse(user.TeacherInfo.availableWeekdays).sort((a, b) => a - b)
            : null
        }
      })

      const searchedUsers = result.filter(user => {
        if (!user.introduce) { return user.name.includes(keyword) }
        return user.name.includes(keyword) || user.introduce.includes(keyword)
      })

      if (searchedUsers.length === 0) throw new Error(`關鍵字 ${keyword} 沒有符合搜尋條件的老師`)

      return cb(null, { result: searchedUsers, keyword })
    })
      .catch(error => cb(error))
  }
}

module.exports = adminService
