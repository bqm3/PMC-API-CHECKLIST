const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_phanhe = sequelize.define(
  "ent_phanhe",
  {
    ID_Phanhe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    Phanhe: {
      type: DataTypes.CHAR,
    },
    Duongdan: {
      type: DataTypes.CHAR,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "ent_phanhe",
  }
);

module.exports = Ent_phanhe;
