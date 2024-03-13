
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Ent_khuvuc = require("./ent_khuvuc.model");
const Ent_tang = require("./ent_tang.model");
const Ent_user = require("./ent_user.model");

const Ent_checklist = sequelize.define("ent_checklist", {
    
   ID_Checklist: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
   },
   ID_Khuvuc: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   ID_Tang: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   Sothutu: {
     type: DataTypes.INTEGER,
     allowNull: false,
   },
   Maso: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   MaQrCode: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Checklist: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Giatridinhdanh: {
    type: DataTypes.CHAR,
    allowNull: false,
   },
   Giatrinhan: {
    type: DataTypes.CITEXT,
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
},
 {
    freezeTableName: true,
    timestamps: false,
    tableName: 'ent_checklist'
  }
);

Ent_user.hasMany(Ent_checklist, { as: "ent_checklist" });
Ent_tang.hasMany(Ent_checklist, { as: "ent_checklist" });
Ent_khuvuc.hasMany(Ent_checklist, { as: "ent_checklist" });

Ent_checklist.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});
Ent_checklist.belongsTo(Ent_tang, {
  foreignKey: "ID_Tang",
});
Ent_checklist.belongsTo(Ent_khuvuc, {
  foreignKey: "ID_Khuvuc",
});

module.exports = {
  Ent_checklist,
  Ent_user,
  Ent_tang,
  Ent_khuvuc
};


