'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Class.belongsTo(models.User, { foreignKey: 'userId' })
      Class.belongsTo(models.TeacherInfo, { foreignKey: 'teacherInfoId' })
    }
  };
  Class.init({
    classTime: DataTypes.DATE,
    duration: DataTypes.STRING,
    isDone: DataTypes.BOOLEAN,
    rate: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    teacherInfoId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Class',
    tableName: 'Classes',
    underscored: true
  })
  return Class
}
