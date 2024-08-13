const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_nhom = sequelize.define(
  "ent_nhom",
  {
    ID_Nhom: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    Nhom: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "ent_nhom",
  }
);

module.exports = Ent_nhom;
