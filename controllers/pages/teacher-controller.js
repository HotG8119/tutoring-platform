const teacherServices = require('../../services/teachers-services')

const teacherController = {
  getBecomeTeacher: (req, res, next) => {
    teacherServices.getBecomeTeacher(req, (error, data) => {
      if (error) return next(error)
      return res.render('users/become-teacher')
    })
  },
  postBecomeTeacher: (req, res, next) => {
    teacherServices.postBecomeTeacher(req, (error, data) => {
      if (error) return next(error)
      return res.redirect(`/users/${req.user.id}`)
    })
  },
  getTeacherInfo: (req, res, next) => {
    teacherServices.getTeacherInfo(req, (error, data) => {
      if (error) return next(error)
      return res.render('users/teacher', data)
    })
  },
  editTeacherInfo: (req, res, next) => {
    teacherServices.editTeacherInfo(req, (error, data) => {
      if (error) return next(error)
      return res.render('users/edit-teacher', data)
    })
  },
  putTeacherInfo: (req, res, next) => {
    teacherServices.putTeacherInfo(req, (error, data) => {
      if (error) return next(error)
      return res.redirect(`/teacher/${req.user.id}`)
    })
  }
}

module.exports = teacherController
