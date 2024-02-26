'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpotImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        references:{model:"Spots", key:"id"},
        onDelete:"CASCADE"
      },
      url: {
        type: Sequelize.STRING
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
    },options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages"
    await queryInterface.dropTable(options);
  }
};