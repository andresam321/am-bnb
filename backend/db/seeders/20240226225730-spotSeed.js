'use strict';

const {Spot} = require("../models")


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
    await Spot.bulkCreate([

    {
      ownerId: 1,
      address: '123 Main St',
      city: 'Springfield',
      state: 'ST',
      country: 'USA',
      lat: 40.7128,
      lng: -74.0060,
      name: 'Spot 1',
      description: 'Description for Spot 1',
      price: 50.00
    },
    {
      ownerId: 2,
      address: '456 Elm St',
      city: 'Springfield',
      state: 'ST',
      country: 'USA',
      lat: 40.7128,
      lng: -74.0060,
      name: 'Spot 2',
      description: 'Description for Spot 2',
      price: 60.00
    },
    {
      ownerId: 3,
      address: '789 Oak St',
      city: 'Springfield',
      state: 'ST',
      country: 'USA',
      lat: 40.7128,
      lng: -74.0060,
      name: 'Spot 3',
      description: 'Description for Spot 3',
      price: 70.00
    }
  ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      options.tableName = 'Spots';
      // const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
    }, {});
  }
};
