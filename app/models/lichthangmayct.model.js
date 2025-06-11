const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Lich_Thangmayct = sequelize.define(
  "Lich_Thangmayct",
  {
    ID_ThangmayCT: {
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
      type: DataTypes.STRING,
    },
    ID_Checklist: {
      type: DataTypes.INTEGER,
    },
    ID_ChecklistC: {
      type: DataTypes.INTEGER,
    },
    Giatridinhdanh: {
      type: DataTypes.STRING,
    },
    Giatrighinhan: {
      type: DataTypes.STRING,
    },
    Giatrisosanh: {
      type: DataTypes.STRING,
    },
    ID_Loaisosanh: {
      type: DataTypes.INTEGER,
    },
    iChaydg: {
      type: DataTypes.STRING,
    },
    Gioht: {
      type: DataTypes.TIME,
    },
    Duongdananh: {
      type: DataTypes.STRING,
    },
    Ghichu: {
      type: DataTypes.TEXT,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "Lich_Thangmayct",
  }
);

module.exports = Lich_Thangmayct;
