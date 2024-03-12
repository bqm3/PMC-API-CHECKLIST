const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_giamsat = sequelize.define("ent_giamsat", {
    ID_Giamsat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       ID_Duan: {
         type: DataTypes.INTEGER,
         allowNull: false,
       },
       Hoten: {
        type: DataTypes.CHAR,
        allowNull: false,
       },
       ID_Chucvu: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       iQuyen: {
        type: DataTypes.INTEGER,
        allowNull: false
       },
       isDelete: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
       },
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_giamsat'
});

module.exports = Ent_giamsat;