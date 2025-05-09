const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Lich_LamViec_PhanHe = sequelize.define(
  "Lich_LamViec_PhanHe",
  {
    IDBKeyRange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ID_Phanhe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ID_Ngay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Lamviec: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "Lich_LamViec_PhanHe",
  }
);

module.exports = Lich_LamViec_PhanHe;
