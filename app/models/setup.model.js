const Ent_duan = require("./ent_duan.model");
const Ent_toanha = require("./ent_toanha.model");
const Ent_calv = require("./ent_calv.model");
// const Ent_checklist = require("./ent_checklist.model");
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

//

module.exports = { Ent_toanha, Ent_duan, Ent_khuvuc, Ent_khoicv };
