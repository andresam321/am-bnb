'use strict';
const {SpotImage} = require("../models")

let options = {};

if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await SpotImage.bulkCreate([
    { 
      spotId: 1,
      url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710977593/am-bnb%20authme_Project/23738d097f841c61bd654a8d49c6e303-cc_ft_1344_jfjwdt.webp',
      preview: true
    },
    { 
      spotId: 2,
      url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978037/am-bnb%20authme_Project/0d7889bbc3de991708ca9bf0ff27bf1e-cc_ft_1344_ee9sky.webp',
      preview: true
    },
    { 
      spotId: 3,
      url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978433/am-bnb%20authme_Project/38a2061712557953e15f71ff0bc43d8c-cc_ft_1344_dq4nty.webp',
      preview: true
    },
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      options.tableName = 'SpotImages';
      const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
        url: {
          [Op.in]: [
            'https://res.cloudinary.com/djuzk5um3/image/upload/v1710977593/am-bnb%20authme_Project/23738d097f841c61bd654a8d49c6e303-cc_ft_1344_jfjwdt.webp',
            'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978037/am-bnb%20authme_Project/0d7889bbc3de991708ca9bf0ff27bf1e-cc_ft_1344_ee9sky.webp',
            'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978433/am-bnb%20authme_Project/38a2061712557953e15f71ff0bc43d8c-cc_ft_1344_dq4nty.webp',
          ]
        },
    }, {});
  }
};
