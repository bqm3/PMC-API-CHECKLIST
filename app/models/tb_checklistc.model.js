const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_checklistc = sequelize.define("ent_checklistc", {
    ID_ChecklistC: {
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
       Ngay: {
         type: DataTypes.DATE,
         allowNull: false,
       },
       ID_Calv: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       ID_Giamsat: {
        type: DataTypes.INTEGER,
        allowNull: false,
       },
       Giobd: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Giochupanh1: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Anh1: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
       },
       Giochupanh1: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Anh1: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
       },
       Giochupanh2: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Anh2: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
       },
       Giochupanh3: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Anh3: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
       },
       Giochupanh4: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Anh4: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
       },
       Giokt: {
        type: DataTypes.TIME,
        allowNull: false,
       },
       Ghichu: {
        type: DataTypes.TEXT,
        allowNull: false,
       },
       Tinhtrang: {
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
    tableName: 'ent_checklistc'
});

module.exports = Ent_checklistc;