'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SpotImage.belongsTo(models.Spot,{
        foreignKey:"spotId",
        as: "previewImage"
      })
      // define association here
    }
  }
  SpotImage.init({
    spotId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    preview:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'SpotImage',
  });
  return SpotImage;
};