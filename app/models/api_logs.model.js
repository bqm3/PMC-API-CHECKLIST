const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const api_logs = sequelize.define(
  "api_logs",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.CHAR,
    },

    device_info: {
      type: DataTypes.CHAR,
    },
    endpoint: {
      type: DataTypes.CHAR,
    },
    request_body: {
      type: DataTypes.CHAR,
    },
  },
  {
    freezeTableName: true,
    // timestamps: true,
    tableName: "api_logs",
  }
);

module.exports = api_logs;
