const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const beboi = sequelize.define(
  "beboi",
  {
    ID_Beboi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    Ngay_ghi_nhan: {
      type: DataTypes.DATE,
    },
    Nguoi_tao: {
      type: DataTypes.CHAR,
    },
    ID_Checklist: {
      type: DataTypes.INTEGER,
    },
    ID_ChecklistC: {
      type: DataTypes.INTEGER,
    },
    Giatridinhdanh: {
      type: DataTypes.CHAR,
    },
    Giatrighinhan: {
      type: DataTypes.CHAR,
    },
    Giatrisosanh: {
      type: DataTypes.CHAR,
    },
    ID_Loaisosanh: {
      type: DataTypes.INTEGER,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "BEBOI",
  }
);

module.exports = beboi;
