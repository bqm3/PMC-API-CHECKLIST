const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_duan = sequelize.define("ent_duan", {
    ID_Duan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
       },
       Duan: {
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
    tableName: 'ent_duan'
});

module.exports = Ent_duan;