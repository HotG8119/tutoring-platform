const classServices = require('../../services/class-services')

const classController = {
  getTeachers: (req, res, next) => {
    classServices.getTeachers(req, (error, data) => {
      if (error) return next(error)
      return res.render('classes', data)
    })
  },
  getSearchedTeachers: (req, res, next) => {
    classServices.getSearchedTeachers(req, (error, data) => {
      if (error) return next(error)
      return res.render('classes', data)
    })
  },
  getTeacher: (req, res, next) => {
    classServices.getTeacher(req, (error, data) => {
      if (error) return next(error)
      return res.render('teachers', data)
    })
  },
  rateClass: (req, res, next) => {
    classServices.rateClass(req, (error, data) => {
      if (error) return next(error)
      return res.redirect(`/users/${req.user.id}`)
    })
  },
  bookClass: (req, res, next) => {
    classServices.bookClass(req, (error, data) => {
      if (error) return next(error)
      return res.redirect(`/users/${data.teacherInfoId}`)
    })
  }
}

module.exports = classController
