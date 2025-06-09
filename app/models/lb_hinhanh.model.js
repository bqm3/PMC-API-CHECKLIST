const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const LB_hinhanh = sequelize.define(
  "LB_HinhAnh",
  {
    ID_Anh: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_YeuCau: {
      type: DataTypes.INTEGER,
    },
    ID_XuLy: {
      type: DataTypes.INTEGER,
    },
    URL: {
      type: DataTypes.STRING,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "LB_HinhAnh",
  }
);

module.exports = LB_hinhanh;
