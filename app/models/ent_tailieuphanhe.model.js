const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_tailieuphanhe = sequelize.define(
  "ent_tailieuphanhe",
  {
    ID_Duongdantl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Phanhe: {
      type: DataTypes.INTEGER,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    Duongdan: {
      type: DataTypes.CHAR,
    },
    Ghichu: {
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
    tableName: "ent_tailieuphanhe",
  }
);

module.exports = Ent_tailieuphanhe;
