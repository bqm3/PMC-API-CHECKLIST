const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Tb_User_History = sequelize.define(
  "tb_user_history",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    ID_Chucvu: {
      type: DataTypes.INTEGER,
    },
    Ngay: {
      type: DataTypes.STRING(50),
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "tb_user_history",
  }
);

module.exports = Tb_User_History;
