const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const S0_Thaydoithe = sequelize.define(
  "S0_Thaydoithe",
  {
    ID_Thaydoithe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ngaytd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sltheoto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    slthexemay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dcemail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lydothaydoi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDelete: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "S0_Thaydoithe",
  }
);

module.exports = S0_Thaydoithe;