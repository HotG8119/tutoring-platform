'use strict'

const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id from Users;')
    // 打亂 users.id 陣列
    const shuffledUsers = users[0].sort(() => 0.5 - Math.random())

    await queryInterface.bulkInsert('TeacherInfos',
      // 讓10位使用者都有老師資料
      Array.from({ length: 10 }).map((d, i) => {
        return {
          class_introduce: faker.lorem.text().substring(0, 80),
          method: faker.lorem.text().substring(0, 80),
          class_link: faker.internet.url(),
          duration: Math.random() < 0.5 ? 30 : 60,
          available_weekdays: JSON.stringify(Array.from({ length: 7 }, (_, i) => (i + 1).toString()).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 7) + 1)),
          // available_weekdays是陣列，但是資料庫裡面是字串，所以要用JSON.stringify轉成字串
          // Array.from({ length: 7 }, (_, i) => (i + 1).toString())是產生一個長度為7的陣列，裡面的值是1~7的字串
          // sort(() => 0.5 - Math.random())是將陣列隨機排序
          user_id: shuffledUsers[i].id,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    )
  },
  down: async (queryInterface, Sequelize) => { // 清空資料表中所有資料
    await queryInterface.bulkDelete('TeacherInfos', {})
  }
}
