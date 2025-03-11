const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const S0_Thaydoithe_Log = sequelize.define(
  "S0_Thaydoithe_Log",
  {
    ID_Log: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Thaydoithe: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    lydothaydoi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDelete: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "CREATE, UPDATE, DELETE",
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "S0_Thaydoithe_Log",
  }
);

module.exports = S0_Thaydoithe_Log;
