const Ent_duan = require("./ent_duan.model");
const Ent_toanha = require("./ent_toanha.model");
const Ent_calv = require("./ent_calv.model");
const Ent_checklist = require("./ent_checklist.model");
const Ent_chucvu = require("./ent_chucvu.model");
const Ent_khoicv = require("./ent_khoicv.model");
const Ent_giamsat = require("./ent_giamsat.model");
const Ent_khuvuc = require("./ent_khuvuc.model");
const Ent_tang = require("./ent_tang.model");
const Ent_user = require("./ent_user.model");
const Tb_checklistc = require("./tb_checklistc.model");
const Tb_checklistchitiet = require("./tb_checklistchitiet.model");

// Toa nha
Ent_duan.hasMany(Ent_toanha, { as: "ent_toanha" });
Ent_toanha.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

// Khu vuc
Ent_user.hasMany(Ent_khuvuc);
Ent_khuvuc.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

Ent_khoicv.hasMany(Ent_khuvuc);
Ent_khuvuc.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

Ent_toanha.hasMany(Ent_khuvuc);
Ent_khuvuc.belongsTo(Ent_toanha, {
  foreignKey: "ID_Toanha",
});

// Ca lam viec
Ent_duan.hasMany(Ent_calv);
Ent_calv.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_khoicv.hasMany(Ent_calv);
Ent_calv.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

Ent_user.hasMany(Ent_calv);
Ent_calv.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

// User
Ent_chucvu.hasMany(Ent_user);
Ent_user.belongsTo(Ent_chucvu, {
  foreignKey: "Permission",
});

Ent_duan.hasMany(Ent_user);
Ent_user.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_khoicv.hasMany(Ent_user);
Ent_user.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

// Checklist
Ent_khuvuc.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_khuvuc, {
  foreignKey: "ID_Khuvuc",
});

Ent_tang.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_tang, {
  foreignKey: "ID_Tang",
});

Ent_user.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

//Giam sat
Ent_duan.hasMany(Ent_giamsat);
Ent_giamsat.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_chucvu.hasMany(Ent_giamsat);
Ent_giamsat.belongsTo(Ent_chucvu, {
  foreignKey: "ID_Chucvu",
});

//ChecklistC
Ent_duan.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_khoicv.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

Ent_calv.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_calv, {
  foreignKey: "ID_Calv",
});

Ent_giamsat.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_giamsat, {
  foreignKey: "ID_Giamsat",
});

// Checklist Chi tiet
Tb_checklistc.hasMany(Tb_checklistchitiet);
Tb_checklistchitiet.belongsTo(Tb_checklistc, {
  foreignKey: "ID_ChecklistC",
});

Ent_checklist.hasMany(Tb_checklistchitiet);
Tb_checklistchitiet.belongsTo(Ent_checklist, {
  foreignKey: "ID_Checklist",
});


module.exports = {
  Ent_toanha,
  Ent_duan,
  Ent_khuvuc,
  Ent_khoicv,
  Ent_user,
  Ent_calv,
  Ent_chucvu,
  Ent_tang,
  Ent_giamsat,
  Ent_checklist,
  Tb_checklistc,
  Tb_checklistchitiet,
};
