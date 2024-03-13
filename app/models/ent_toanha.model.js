const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_duan = require("./ent_duan.model");

const Ent_toanha = sequelize.define("ent_toanha", {
    ID_Toanha: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       ID_Duan: {
         type: DataTypes.INTEGER,
         allowNull: false,
       },
       Toanha: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       Sotang: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       
       isDelete: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
       },
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_toanha'
});


module.exports = Ent_toanha;