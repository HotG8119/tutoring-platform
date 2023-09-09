'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      name: 'root',
      email: 'root@example.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }])
    console.log('Admins seed data created successfully')
  },
  down: async (queryInterface, Sequelize) => { // 清空資料表中所有資料
    await queryInterface.bulkDelete('Users', {})
  }
}
