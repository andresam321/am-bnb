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
      url: 'https://example.com/spotimage1.jpg',
      preview: true
    },
    { 
      spotId: 2,
      url: 'https://example.com/spotimage2.jpg',
      preview: false
    },
    { 
      spotId: 3,
      url: 'https://example.com/spotimage3.jpg',
      preview: false
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
            'https://example.com/spotimage1.jpg',
            'https://example.com/spotimage2.jpg',
            'https://example.com/spotimage3.jpg',
          ]
        },
    }, {});
  }
};
