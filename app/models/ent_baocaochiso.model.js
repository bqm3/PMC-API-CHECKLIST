
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_baocaochiso = sequelize.define("ent_baocaochiso", {
    
   ID_Baocaochiso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
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
   Electrical: {
    type: DataTypes.FLOAT,
   },
   Water: {
    type: DataTypes.FLOAT,
   },
   ImageElectrical: {
    type: DataTypes.CHAR
   },
   ImageWater: {
    type: DataTypes.CHAR
   },
   ElectricalBefore: {
    type: DataTypes.FLOAT
   },
   WaterBefore: {
    type: DataTypes.FLOAT
   },
   Ghichu: {
    type: DataTypes.TEXT
   },
   isDelete: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
   },
},
 {
    freezeTableName: true,
    timestamps: true,
    tableName: 'ent_baocaochiso'
  }
);

module.exports = Ent_baocaochiso;


