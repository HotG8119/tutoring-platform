'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      class_time: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.STRING
      },
      is_done: {
        type: Sequelize.BOOLEAN
      },
      rate: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.TEXT
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      teacher_id: {
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
    await queryInterface.dropTable('Classes')
  }
}
