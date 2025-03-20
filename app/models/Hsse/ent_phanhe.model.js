const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.config");

const Ent_Phanhe = sequelize.define(
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
      allowNull: false,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      default: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "ent_phanhe",
  }
);

module.exports = Ent_Phanhe;
