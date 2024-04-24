const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_Hangmuc = sequelize.define("ent_hangmuc", {
    ID_Hangmuc: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       ID_Khuvuc: {
         type: DataTypes.INTEGER,
         allowNull: false,
       },
       MaQrCode: {
        type: DataTypes.TEXT,
       },
       Hangmuc: {
        type: DataTypes.TEXT,
       },
       Tieuchuankt: {
        type: DataTypes.TEXT,
       },
       isDelete: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
       },
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_hangmuc'
});

module.exports = Ent_Hangmuc;