const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Tb_checklistchitiet = sequelize.define(
  "tb_checklistchitiet",
  {
    ID_ChecklistChitiet: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_ChecklistC: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ID_Checklist: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Ketqua: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    Anh: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    Gioht: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    Ghichu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "tb_checklistchitiet",
  }
);

module.exports = Tb_checklistchitiet;
