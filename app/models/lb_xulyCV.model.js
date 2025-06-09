const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const LB_xulyCV = sequelize.define(
  "LB_XuLyCongViec",
  {
    ID_XuLy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_YeuCau: {
      type: DataTypes.INTEGER,
    },
    ID_User: {
      type: DataTypes.INTEGER,
    },
    LanThu: {
      type: DataTypes.INTEGER,
    },
    MoTaCongViec: {
      type: DataTypes.INTEGER,
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
    tableName: "LB_XuLyCongViec",
  }
);

module.exports = LB_xulyCV;
