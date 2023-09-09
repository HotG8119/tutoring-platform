'use strict'

const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      name: 'user1',
      email: 'user1@example.com',
      password: await bcrypt.hash('12345678', 10),
      introduce: 'I am user1',
      image: 'https://i.imgur.com/hepj9ZS.png',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'user2',
      email: 'user2@example.com',
      password: await bcrypt.hash('12345678', 10),
      introduce: 'I am user2',
      image: 'https://i.imgur.com/hepj9ZS.png',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()

    }, {
      name: 'user3',
      email: 'user3@example.com',
      password: await bcrypt.hash('12345678', 10),
      introduce: 'I am user3',
      image: 'https://i.imgur.com/hepj9ZS.png',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    }])

    await queryInterface.bulkInsert('Users',
      Array.from({ length: 20 }).map(() => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        image: 'https://i.imgur.com/hepj9ZS.png',
        role: 'user',
        introduce: faker.lorem.text().substring(0, 80),
        created_at: new Date(),
        updated_at: new Date()
      })
      ))
    console.log('Users seed data created successfully')
  },
  down: async (queryInterface, Sequelize) => { // 清空資料表中所有資料
    await queryInterface.bulkDelete('Users', {})
  }
}
