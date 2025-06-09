const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const LB_yeucauKH = sequelize.define(
  "LB_YeuCauKH",
  {
    ID_YeuCau: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    ID_Phanhe: {
      type: DataTypes.INTEGER,
    },
    ID_Useryc: {
      type: DataTypes.INTEGER,
    },
    TenKhachHang: {
      type: DataTypes.STRING,
    },
    Tenyeucau: {
      type: DataTypes.STRING,
    },
    NoiDung: {
      type: DataTypes.TEXT,
    },
    TrangThai: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "LB_YeuCauKH",
  }
);

module.exports = LB_yeucauKH;
