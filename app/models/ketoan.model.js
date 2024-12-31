const { DataTypes } = require('sequelize');
const sequelize = require("../config/db.config");

const PhiDV = sequelize.define('PhiDV', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true, // Assuming ID is auto-incremented
  },
  Ten_du_an: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  vitri: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  canho: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ngaybangiao: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  chuho: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  dientich: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phidvphainop: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phidvdathu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phidvphaithu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  SLoto: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phioto: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phiotodathu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phiotophaithu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  SLxemay: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phixemay: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixmdathu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixmphaithu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  SLxedien: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phixedien: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixddathu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixdphaithu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  SLxedap: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phixedap: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixedapdathu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  phixedapphaithu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tongphaithu_thang: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  nocu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tongdathu_thang: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tongconphaithu_thang: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  thoigian_no: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lydo_no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  dieuchinh_nocu: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  lydo_dieuchinh: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  thang: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nam: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'PhiDV', // Ensuring the table name matches the one in your DB
  timestamps: false, // Set to true if you have created_at and updated_at fields
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = PhiDV;
