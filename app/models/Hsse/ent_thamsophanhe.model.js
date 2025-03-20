const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.config");

const Ent_Thamsophanhe = sequelize.define(
  "ent_thamsophanhe",
  {
    ID_Thamsophanhe: {
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
    Tenduan: {
      type: DataTypes.STRING,
    },
    Thamso: {
      type: DataTypes.STRING,
    },
    iGiayphep: {
      type: DataTypes.INTEGER,
    },
    Chisogiayphep: {
      type: DataTypes.FLOAT,
    },
    Chisotrungbinh: {
      type: DataTypes.FLOAT,
    },
    Ghichu: {
      type: DataTypes.STRING,
    },
    isDelete: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "ent_thamsophanhe",
  }
);

module.exports = Ent_Thamsophanhe;
