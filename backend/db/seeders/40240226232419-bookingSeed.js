'use strict';

const {Booking} = require("../models")

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
    await Booking.bulkCreate([
    { 
      spotId: 1,
      userId: 1,
      startDate: Date('2024-03-01'),
      endDate: Date('2024-03-05')
    },
    { 
      spotId: 2,
      userId: 2,
      startDate: Date('2024-03-10'),
      endDate: Date('2024-03-15')
    },
    { 
      spotId: 3,
      userId: 3,
      startDate: Date('2022-31-10'),
      endDate: Date('022-23-15')
    },
    ], {validate:true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      options.tableName = 'Bookings'
      const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
        startDate: {
          [Op.in]: ["2024-03-01", "2024-03-10", "2022-31-10"],
        },
      }, {});
  }
};
