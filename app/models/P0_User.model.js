const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const P0_User = sequelize.define(
  "P0_User",
  {
    ID_P0_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "P0_User",
  }
);

module.exports = P0_User;
