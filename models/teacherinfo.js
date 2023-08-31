'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TeacherInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      TeacherInfo.belongsTo(models.User, { foreignKey: 'userId' })
      TeacherInfo.hasMany(models.Class, { foreignKey: 'teacherInfoId' })
    }
  };
  TeacherInfo.init({
    classIntroduce: DataTypes.TEXT,
    method: DataTypes.TEXT,
    classLink: DataTypes.STRING,
    duration: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'TeacherInfo',
    tableName: 'TeacherInfos',
    underscored: true
  })
  return TeacherInfo
}
