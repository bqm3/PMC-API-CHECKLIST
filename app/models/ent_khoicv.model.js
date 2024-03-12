const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_khoicv = sequelize.define("ent_khoicv", {
    ID_Khoi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       KhoiCV: {
         type: DataTypes.CHAR,
         allowNull: false,
       },
       
       isDelete: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
       },
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_khoicv'
});

module.exports = Ent_khoicv;