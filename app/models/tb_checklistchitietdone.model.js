const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Tb_checklistchitietdone = sequelize.define("tb_checklistchitietdone", {
    ID_ChecklistChitietDone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       ID_ChecklistC: {
        type: DataTypes.INTEGER,
      },
       Description: {
         type: DataTypes.JSON,
       },
      
       isDelete: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
       },
},{
    freezeTableName: true,
    timestamps: false,
    tableName: 'tb_checklistchitietdone'
});

module.exports = Tb_checklistchitietdone;