
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_checklist = sequelize.define("ent_checklist", {
    
   ID_Checklist: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
   },
   ID_Khuvuc: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   ID_Tang: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   Sothutu: {
     type: DataTypes.INTEGER,
     allowNull: false,
   },
   Maso: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   MaQrCode: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Checklist: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Giatridinhdanh: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Giatrinhan: {
    type: DataTypes.CITEXT,
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
    tableName: 'ent_checklist'
  }
);

module.exports = Ent_checklist;


