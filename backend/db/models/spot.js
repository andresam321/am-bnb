'use strict';
const {Model, Validator} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User, {
        foreignKey:"ownerId",
        
      })
      Spot.hasMany(models.Booking,{
        foreignKey:"spotId",
        onDelete:"CASCADE"
      })
      Spot.hasMany(models.Review,{
        foreignKey:"spotId",
        onDelete:"CASCADE"
      })
      Spot.hasMany(models.SpotImage,{
        foreignKey:"spotId",
        onDelete:"CASCADE"
      })
      // define association here
    }
  }
  Spot.init({
    ownerId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL,
    name:{
      type:DataTypes.STRING,
      allowNull:false
    }, 
    description: {
      type:DataTypes.STRING,
      allowNull:false
    },
    price: DataTypes.DECIMAL,
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};