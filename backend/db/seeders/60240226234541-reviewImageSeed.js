'use strict';

const {ReviewImage} = require("../models")

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
    await ReviewImage.bulkCreate([
      { 
        reviewId: 1,
        url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp'
      },
      { 
        reviewId: 2,
        url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp'
      },
      { 
        reviewId: 3,
        url: 'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp'
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
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: [
          'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp',
          'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp',
          'https://res.cloudinary.com/djuzk5um3/image/upload/v1710978749/am-bnb%20authme_Project/3df9100478b396c63430be33820247e4-uncropped_scaled_within_1536_1152_oysg3t.webp'
        ],
      },
    }, {});
  }
};
