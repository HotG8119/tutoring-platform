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
  getUsers: (req, res, next) => {
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
      .catch(error => next(error))
  },
  getSearchedUsers: (req, res, next) => {
    const keyword = req.query.keyword.replace(/[^a-zA-Z0-9]/g, '').trim()

    User.findAll({
      raw: true,
      nest: true,
      attributes: { exclude: ['password'] },
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
        if (!user.introduce) {
          return user.name.includes(keyword)
        }
        return user.name.includes(keyword) || user.introduce.includes(keyword)
      })
      if (searchedUsers.length === 0) {
        req.flash('error_messages', '查無符合條件的使用者')
        return res.redirect('/admin/users')
      }
      return res.render('admin/users', { result: searchedUsers, keyword })
    })
      .catch(error => next(error))
  }
}

module.exports = adminController
