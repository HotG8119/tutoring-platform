'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TeacherInfos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      class_introduce: {
        type: Sequelize.TEXT
      },
      method: {
        type: Sequelize.TEXT
      },
      class_link: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      available_weekdays: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TeacherInfos')
  }
}
