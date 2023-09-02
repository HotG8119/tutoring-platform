'use strict'

const faker = require('faker')

function getRandomPastTime () {
  const pastDate = faker.date.between('2023-09-01T18:00:00.000Z', '2023-09-01T21:00:00.000Z')
  pastDate.setMinutes(0)
  pastDate.setSeconds(0)

  return pastDate
}

function getRandomFutureTime () {
  // 生成未來兩週內的隨機日期
  const futureDate = faker.date.between(
    new Date(),
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  )
  futureDate.setMinutes(0)
  futureDate.setSeconds(0)

  // 設定時間範圍為18:00至21:00
  const randomHour = faker.datatype.number({ min: 18, max: 20 }) // 18至20（24小時制）
  futureDate.setHours(randomHour, 0, 0, 0)
  return futureDate
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id from Users;')
    const teacherInfos = await queryInterface.sequelize.query('SELECT user_id, duration from TeacherInfos;')

    const classes = []

    // // 讓每個 user 都有兩堂上過課，且每堂課都未打分及留言
    users[0].forEach((user, i) => {
      Array.from({ length: 2 })
        .map((_, j) => {
        // 隨機一個老師
          const randomTeacherNum = Math.floor(Math.random() * teacherInfos[0].length)

          return classes.push({
            class_time: getRandomPastTime(),
            duration: teacherInfos[0][randomTeacherNum].duration,
            is_done: true,
            user_id: user.id,
            teacher_info_id: teacherInfos[0][randomTeacherNum].user_id,
            created_at: new Date()
          })
        })
    })

    // // 讓每個老師都有兩堂上過課，且每堂課都已打分及留言
    teacherInfos[0].forEach((teacherInfo, i) => {
      Array.from({ length: 2 })
        .map((_, j) => {
        // 隨機一個使用者
          const randomUserNum = Math.floor(Math.random() * users[0].length)

          return classes.push({
            class_time: getRandomPastTime(),
            duration: teacherInfo.duration,
            is_done: true,
            rate: Math.floor(Math.random() * 5) + 1,
            message: faker.lorem.text().substring(0, 80),
            user_id: users[0][randomUserNum].id,
            teacher_info_id: teacherInfo.user_id,
            created_at: new Date()
          })
        })
    })

    // 讓每個老師有兩堂未上過課
    teacherInfos[0].forEach((teacherInfo, i) => {
      Array.from({ length: 2 })
        .map((_, j) => {
        // 隨機一個使用者
          const randomUserNum = Math.floor(Math.random() * users[0].length)

          return classes.push({
            class_time: getRandomFutureTime(),
            duration: teacherInfo.duration,
            user_id: users[0][randomUserNum].id,
            teacher_info_id: teacherInfo.user_id,
            created_at: new Date()
          })
        })
    })

    await queryInterface.bulkInsert('Classes', classes)

    console.log('Classes seed data created successfully')
  },
  down: async (queryInterface, Sequelize) => { // 清空資料表中所有資料
    await queryInterface.bulkDelete('Classes', {})
  }
}
