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
       ID_KhoiCV: {
        type: DataTypes.INTEGER,
      },
       Hoten: {
        type: DataTypes.CHAR,
       },
       Gioitinh: {
        type: DataTypes.CHAR,
       },
       Ngaysinh: {
        type: DataTypes.CHAR,
       },
       Sodienthoai: {
        type: DataTypes.CHAR,
       },
       ID_Chucvu: {
        type: DataTypes.INTEGER,
       },
       iQuyen: {
        type: DataTypes.INTEGER,
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