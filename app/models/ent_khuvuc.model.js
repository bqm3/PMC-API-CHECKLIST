const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_khuvuc = sequelize.define("ent_khuvuc", {
    ID_Khuvuc: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       ID_Toanha: {
         type: DataTypes.INTEGER,
         allowNull: false,
       },
       ID_KhoiCV: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       ID_KhoiCVs: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       Sothutu: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       Makhuvuc: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       MaQrCode: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       Tenkhuvuc: {
        type: DataTypes.CHAR,
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
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_khuvuc'
});

module.exports = Ent_khuvuc;