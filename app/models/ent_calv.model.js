
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_calv = sequelize.define("ent_calv", {
    
   ID_Calv: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
   },
   ID_Duan: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   ID_KhoiCV: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   Tenca: {
     type: DataTypes.CHAR,
     allowNull: false,
   },
   Giobatdau: {
    type: DataTypes.TIME,
    allowNull: false,
   },
   Gioketthuc: {
    type: DataTypes.TIME,
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
    timestamps: false,
    tableName: 'ent_calv'
  }
);

module.exports = Ent_calv;


