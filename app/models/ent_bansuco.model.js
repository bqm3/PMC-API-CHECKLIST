const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const ent_bansuco = sequelize.define(
  "ent_bansuco",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ma_nv: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    ho_ten: {
      type: DataTypes.CHAR,
    },
    khoi: {
      type: DataTypes.CHAR,
    },
    chuc_vu: {
      type: DataTypes.CHAR,
    },
    sdt: {
      type: DataTypes.CHAR,
    },
    email: {
      type: DataTypes.CHAR,
    },
    email: {
      type: DataTypes.CHAR,
    },
    isDelete: {
      type: DataTypes.CHAR,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "ent_bansuco",
  }
);

module.exports = ent_bansuco;
