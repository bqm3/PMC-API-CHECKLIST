const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_baocaochiso = sequelize.define(
  "ent_baocaochiso",
  {
    ID_Baocaochiso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    ID_User: {
      type: DataTypes.INTEGER,
    },
    Day: {
      type: DataTypes.DATE,
    },
    Month: {
      type: DataTypes.INTEGER,
    },
    Year: {
      type: DataTypes.INTEGER,
    },
    Electrical_CDT: {
      type: DataTypes.FLOAT,
    },
    Water_CDT: {
      type: DataTypes.FLOAT,
    },
    ImageElectrical_CDT: {
      type: DataTypes.CHAR,
    },
    ImageWater_CDT: {
      type: DataTypes.CHAR,
    },
    ElectricalBefore_CDT: {
      type: DataTypes.FLOAT,
    },
    WaterBefore_CDT: {
      type: DataTypes.FLOAT,
    },
    Electrical_CuDan: {
      type: DataTypes.FLOAT,
    },
    Water_CuDan: {
      type: DataTypes.FLOAT,
    },
    ImageElectrical_CuDan: {
      type: DataTypes.CHAR,
    },
    ImageWater_CuDan: {
      type: DataTypes.CHAR,
    },
    ElectricalBefore_CuDan: {
      type: DataTypes.FLOAT,
    },
    WaterBefore_CuDan: {
      type: DataTypes.FLOAT,
    },
    Electrical_CDT_Real: {
      type: DataTypes.FLOAT,
    },
    Water_CDT_Real: {
      type: DataTypes.FLOAT,
    },
    Electrical_CuDan_Real: {
      type: DataTypes.FLOAT,
    },
    Water_CuDan_Real: {
      type: DataTypes.FLOAT,
    },
    Ghichu: {
      type: DataTypes.TEXT,
    },
    isDelete: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "ent_baocaochiso",
  }
);

module.exports = Ent_baocaochiso;
