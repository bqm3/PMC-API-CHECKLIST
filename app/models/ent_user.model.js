const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_user = sequelize.define("ent_user", {
    ID_User: {
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
       },
       UserName: {
         type: DataTypes.CHAR,
         allowNull: false,
       },
       Password: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       Emails: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       ID_Khuvucs: {
        type: DataTypes.JSON,
       },
       Permission: {
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
    tableName: 'ent_user'
});

module.exports = Ent_user;