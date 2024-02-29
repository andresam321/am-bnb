'use strict';

const {Review} = require("../models")

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
    await Review.bulkCreate([
    { 
      spotId: 1,
      userId: 1,
      review: 'Great spot! Loved the ambiance.',
      stars: 5
    },
    { 
      spotId: 2,
      userId: 2,
      review: 'Good experience overall. Will visit again.',
      stars: 4
    },
    { 
      spotId: 3,
      userId: 3,
      review: 'BAD experience overall. Will never visit again.',
      stars: 1
    },
  ],{validate:true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      options.tableName = 'Reviews';
      return queryInterface.bulkDelete(options, {
    }, {});
  }
};
