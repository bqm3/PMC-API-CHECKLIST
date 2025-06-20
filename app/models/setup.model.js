const Ent_duan = require("./ent_duan.model");
const Ent_toanha = require("./ent_toanha.model");
const Ent_calv = require("./ent_calv.model");
const Ent_hangmuc = require("./ent_hangmuc.model");
const Ent_checklist = require("./ent_checklist.model");
const Ent_chucvu = require("./ent_chucvu.model");
const Ent_khoicv = require("./ent_khoicv.model");
const Ent_khuvuc = require("./ent_khuvuc.model");
const Ent_tang = require("./ent_tang.model");
const Ent_user = require("./ent_user.model");
const Tb_checklistc = require("./tb_checklistc.model");
const Tb_checklistchitiet = require("./tb_checklistchitiet.model");
const Tb_checklistchitietdone = require("./tb_checklistchitietdone.model");
const Tb_sucongoai = require("./tb_sucongoai.model");
const Ent_ChecklistReplace = require("./ent_checklistreplace.model");
const Ent_nhom = require("./ent_nhom.model");
const Ent_khuvuc_khoicv = require("./ent_khuvuc_khoicv.model");
const Ent_thietlapca = require("./ent_thietlapca.model");
const Ent_duan_khoicv = require("./ent_duan_khoicv.model");
const Ent_loaisosanh = require("./ent_loaisosanh.model");
const Ent_phanhe = require("./ent_phanhe.model");
const Ent_tailieuphanhe = require("./ent_tailieuphanhe.model");

const Ent_chinhanh = require("./ent_chinhanh.model");
const Ent_linhvuc = require("./ent_linhvuc.model");
const Ent_loaihinhbds = require("./ent_loaihinhbds.model");
const Ent_phanloaida = require("./ent_phanloaida.model");

//hsse
const Ent_Hsse_User = require("./Hsse/ent_hsse_user.model");
const HSSE_Log = require("./Hsse/hsse_log.model");
const HSSE = require("./hsse.model");
const Ent_Phanhe = require("./Hsse/ent_phanhe.model");
const Ent_Thamsophanhe = require("./Hsse/ent_thamsophanhe.model");
const Lich_LamViec_PhanHe = require("./Lich_LamViec_PhanHe.model");

//P0
const P0_User = require("./P0_User.model");
const P0 = require("./P0.model");
const P0_Log = require("./P0_Log.model");

// Be boi
const beboi = require("./beboi.model");

//S0
const S0_Thaydoithe = require("./s0_thaydoithe.model");
const S0_Thaydoithe_log = require("./s0_thaydoithe_log.model");

//bao cao chi so
const Ent_Loai_Chiso = require("./BaocaochisoModel/ent_loai_chiso.model");
const Ent_Hangmuc_Chiso = require("./BaocaochisoModel/ent_hangmuc_chiso.model");
const Ent_Baocaochiso = require("./BaocaochisoModel/ent_baocaochiso.model");
const Ent_hsse_user = require("./Hsse/ent_hsse_user.model");

const Tb_User_History = require("./tb_user_history.model");
const Ent_bansuco = require("./ent_bansuco.model");

// lb
const LB_yeucauKH = require("./lb_yeucauKH.model");
const LB_xulyCV = require("./lb_xulyCV.model");
const LB_hinhanh = require("./lb_hinhanh.model");

// thangmay
const Lich_Thangmayct = require("./lichthangmayct.model");

LB_xulyCV.hasMany(LB_hinhanh, {as: "hinhanh_xuly", foreignKey: 'ID_Xuly'});
LB_xulyCV.belongsTo(Ent_user, {as: "ent_user", foreignKey: 'ID_User'});

LB_yeucauKH.belongsTo(Ent_user, {as: "ent_user", foreignKey: 'ID_Useryc', targetKey: "ID_User"});
LB_yeucauKH.belongsTo(Ent_duan, {as: "ent_duan", foreignKey: 'ID_Duan'});
LB_yeucauKH.hasMany(LB_hinhanh, {as: "hinhanh_yeucau", foreignKey: 'ID_Yeucau'});
LB_yeucauKH.hasMany(LB_xulyCV, {as: "lb_xuly", foreignKey: 'ID_YeuCau'});
LB_yeucauKH.belongsTo(Ent_phanhe, {as: "ent_phanhe", foreignKey: "ID_Phanhe"});

Lich_LamViec_PhanHe.belongsTo(Ent_duan, {
  as: "ent_duan",
  foreignKey: "ID_Duan",
});
Ent_Hangmuc_Chiso.belongsTo(Ent_duan, {
  as: "ent_duan",
  foreignKey: "ID_Duan",
});
Ent_Hangmuc_Chiso.belongsTo(Ent_Loai_Chiso, {
  as: "ent_loai_chiso",
  foreignKey: "ID_LoaiCS",
});

Ent_tailieuphanhe.belongsTo(Ent_Phanhe, {
  as: "ent_phanhe",
  foreignKey: "ID_Phanhe",
});

Ent_Thamsophanhe.belongsTo(Ent_Phanhe, {
  as: "ent_phanhe",
  foreignKey: "ID_Phanhe",
});
// Ent_duan.belongsToMany(Ent_Loai_Chiso, {
//   through: 'ent_loai_chiso',
//   foreignKey: 'ID_Duan',
//   otherKey: 'ID_LoaiCS',
//   as: 'ent_loaics'
// });

Ent_Baocaochiso.belongsTo(Ent_Hangmuc_Chiso, {
  as: "ent_hangmuc_chiso",
  foreignKey: "ID_Hangmuc_Chiso",
});

Ent_Baocaochiso.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

Ent_user.hasOne(Ent_Baocaochiso, {
  foreignKey: "ID_User",
});

Ent_Baocaochiso.hasMany(Ent_duan, {
  as: "ent_duan", // The actual alias used in the model
  foreignKey: "ID_Duan",
});

Ent_duan.belongsTo(Ent_Baocaochiso, {
  foreignKey: "ID_Duan",
});

//Hsse =================================================================================
Ent_hsse_user.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });
Ent_hsse_user.belongsTo(Ent_user, { as: "ent_user", foreignKey: "ID_User" });
HSSE_Log.belongsTo(HSSE, { as: "hsse", foreignKey: "ID_HSSE" });

//P0   ==================================================================================
P0_User.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });
P0_User.belongsTo(Ent_user, { as: "ent_user", foreignKey: "ID_User" });

P0.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });
P0.belongsTo(Ent_user, { as: "ent_user_AN", foreignKey: "ID_User_AN" });
P0.belongsTo(Ent_user, { as: "ent_user_KT", foreignKey: "ID_User_KT" });
P0.belongsTo(Ent_user, { as: "ent_user_DV", foreignKey: "ID_User_DV" });

P0_Log.belongsTo(P0, { as: "P0", foreignKey: "ID_P0" });
P0_Log.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });
P0_Log.belongsTo(Ent_user, { as: "ent_user_AN", foreignKey: "ID_User_AN" });
P0_Log.belongsTo(Ent_user, { as: "ent_user_KT", foreignKey: "ID_User_KT" });

//Duan an + khoi cv  ====================================================================
Ent_duan.hasMany(Ent_duan_khoicv, {
  as: "ent_duan_khoicv",
  foreignKey: "ID_Duan",
});
Ent_duan_khoicv.belongsTo(Ent_duan, { foreignKey: "ID_Duan" });
Ent_duan_khoicv.belongsTo(Ent_phanhe, { foreignKey: "ID_Phanhe" });

Ent_chinhanh.hasMany(Ent_duan, {
  as: "ent_chinhanh",
  foreignKey: "ID_Chinhanh",
});
Ent_duan.belongsTo(Ent_chinhanh, { foreignKey: "ID_Chinhanh" });

Ent_linhvuc.hasMany(Ent_duan, { as: "ent_linhvuc", foreignKey: "ID_Linhvuc" });
Ent_duan.belongsTo(Ent_linhvuc, { foreignKey: "ID_Linhvuc" });

Ent_loaihinhbds.hasMany(Ent_duan, {
  as: "ent_loaihinhbds",
  foreignKey: "ID_Loaihinh",
});
Ent_duan.belongsTo(Ent_loaihinhbds, { foreignKey: "ID_Loaihinh" });

Ent_phanloaida.hasMany(Ent_duan, {
  as: "ent_phanloaida",
  foreignKey: "ID_Phanloai",
});
Ent_duan.belongsTo(Ent_phanloaida, { foreignKey: "ID_Phanloai" });

Ent_khoicv.hasMany(Ent_duan_khoicv, {
  as: "ent_duan_khoicv",
  foreignKey: "ID_KhoiCV",
});
Ent_duan_khoicv.belongsTo(Ent_khoicv, { foreignKey: "ID_KhoiCV" });

// Su co ngoai ===========================================================================
Ent_khuvuc_khoicv.hasMany(Tb_sucongoai, {
  as: "ent_khuvuc_khoicv",
  foreignKey: "ID_KV_CV",
});
Tb_sucongoai.belongsTo(Ent_khuvuc_khoicv, { foreignKey: "ID_KV_CV" });

Ent_hangmuc.hasMany(Tb_sucongoai, {
  as: "ent_hangmuc",
  foreignKey: "ID_Hangmuc",
});
Tb_sucongoai.belongsTo(Ent_hangmuc, { foreignKey: "ID_Hangmuc" });

Ent_user.hasMany(Tb_sucongoai, { as: "ent_user", foreignKey: "ID_User" });
Tb_sucongoai.belongsTo(Ent_user, { as: "ent_user", foreignKey: "ID_User" });

Ent_user.hasMany(Tb_sucongoai, { as: "ent_handler", foreignKey: "ID_Handler" });
Tb_sucongoai.belongsTo(Ent_user, {
  as: "ent_handler",
  foreignKey: "ID_Handler",
});

Tb_sucongoai.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });

// Ent_duan.hasMany(Tb_sucongoai, { as: "ent_duan", foreignKey: "ID_Duan" });
// Tb_sucongoai.belongsTo(Ent_duan, { as: "ent_duan", foreignKey: "ID_Duan" });

// Thiet lap ca ===========================================================================

Ent_calv.hasMany(Ent_thietlapca, {
  as: "ent_thietlapca",
  foreignKey: "ID_Calv",
});
Ent_thietlapca.belongsTo(Ent_calv, { foreignKey: "ID_Calv" });

Ent_duan.hasMany(Ent_thietlapca, { as: "ent_duan", foreignKey: "ID_Duan" });
Ent_thietlapca.belongsTo(Ent_duan, { foreignKey: "ID_Duan" });

Ent_duan_khoicv.hasMany(Ent_thietlapca, {
  as: "ent_thietlapca_list",
  foreignKey: "ID_Chuky",
});
Ent_thietlapca.belongsTo(Ent_duan_khoicv, {
  as: "ent_duan_khoicv",
  foreignKey: "ID_Chuky",
});

// Du an ===========================================================================
Ent_nhom.hasMany(Ent_duan, { as: "ent_nhom", foreignKey: "ID_Nhom" });
Ent_duan.belongsTo(Ent_nhom, { foreignKey: "ID_Nhom" });

// Toa nha ===========================================================================
Ent_duan.hasMany(Ent_toanha, { as: "ent_toanha", foreignKey: "ID_Duan" });
Ent_toanha.belongsTo(Ent_duan, { foreignKey: "ID_Duan" });

// Tang ===========================================================================
Ent_duan.hasMany(Ent_tang, { as: "ent_tang" });
Ent_tang.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_user.hasMany(Ent_tang, { as: "ent_tang" });
Ent_tang.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

// Khu vuc ===========================================================================
Ent_user.hasMany(Ent_khuvuc, { foreignKey: "ID_User" });
Ent_khuvuc.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

Ent_khuvuc.hasMany(Ent_khuvuc_khoicv, { foreignKey: "ID_Khuvuc" });
Ent_khuvuc_khoicv.belongsTo(Ent_khuvuc, { foreignKey: "ID_Khuvuc" });

Ent_khoicv.hasMany(Ent_khuvuc_khoicv, { foreignKey: "ID_KhoiCV" });
Ent_khuvuc_khoicv.belongsTo(Ent_khoicv, { foreignKey: "ID_KhoiCV" });

Ent_toanha.hasMany(Ent_khuvuc, { as: "ent_khuvuc", foreignKey: "ID_Toanha" });
Ent_khuvuc.belongsTo(Ent_toanha, {
  foreignKey: "ID_Toanha",
});

// Ca lam viec ===========================================================================
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

// User ===========================================================================
Ent_chucvu.hasMany(Ent_user);
Ent_user.belongsTo(Ent_chucvu, {
  foreignKey: "ID_Chucvu",
});

Ent_duan.hasMany(Ent_user);
Ent_user.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_khoicv.hasMany(Ent_user);
Ent_user.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

Ent_chinhanh.hasMany(Ent_user);
Ent_user.belongsTo(Ent_chinhanh, {
  foreignKey: "ID_Chinhanh",
});

// Checklist ===========================================================================
Ent_khuvuc.hasMany(Ent_checklist);

Ent_checklist.belongsTo(Ent_khuvuc, {
  foreignKey: "ID_Khuvuc",
});
Ent_checklist.belongsTo(Ent_phanhe, {
  foreignKey: "ID_Phanhe",
});
Ent_checklist.belongsTo(Ent_loaisosanh, {
  foreignKey: "ID_Loaisosanh",
});

Ent_hangmuc.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_hangmuc, {
  foreignKey: "ID_Hangmuc",
});

Ent_tang.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_tang, {
  foreignKey: "ID_Tang",
});

Ent_user.hasMany(Ent_checklist);
Ent_checklist.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

// Checklist Faild ===========================================================================
Ent_checklist.hasMany(Ent_ChecklistReplace, {
  as: "ent_checklistreplace",
  foreignKey: "ID_Checklist",
});
Ent_ChecklistReplace.belongsTo(Ent_checklist, {
  foreignKey: "ID_Checklist",
});

// Hạng mục ===========================================================================
Ent_khuvuc.hasMany(Ent_hangmuc, { as: "ent_hangmuc", foreignKey: "ID_Khuvuc" });
Ent_hangmuc.belongsTo(Ent_khuvuc, {
  foreignKey: "ID_Khuvuc",
});

//ChecklistC ===========================================================================
Ent_duan.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_duan, {
  foreignKey: "ID_Duan",
});

Ent_user.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_user, {
  foreignKey: "ID_User",
});

Ent_khoicv.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_khoicv, {
  foreignKey: "ID_KhoiCV",
});

Ent_calv.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_calv, {
  foreignKey: "ID_Calv",
});

Ent_thietlapca.hasMany(Tb_checklistc);
Tb_checklistc.belongsTo(Ent_thietlapca, {
  foreignKey: "ID_ThietLapCa",
});

// Checklist Chi tiet ===========================================================================
Ent_checklist.hasMany(Tb_checklistchitiet);
Tb_checklistchitiet.belongsTo(Ent_checklist, {
  foreignKey: "ID_Checklist",
});

Tb_checklistchitiet.belongsTo(Tb_checklistc, {
  foreignKey: "ID_ChecklistC", // Khóa ngoại trỏ đến bảng Tb_checklistc
  as: "tb_checklistc", // Alias (bạn có thể thay đổi tùy theo mô hình của bạn)
});

Tb_checklistc.hasMany(Tb_checklistchitiet, {
  foreignKey: "ID_ChecklistC", // Khóa ngoại ở bảng Tb_checklistchitiet
  as: "tb_checklistchitiets", // Alias được sử dụng trong `include`
});

// Checklist Chi tiet Done ===========================================================================
Tb_checklistc.hasMany(Tb_checklistchitietdone, {
  as: "tb_checklistchitietdones", // The actual alias used in the model
  foreignKey: "ID_ChecklistC",
});
Tb_checklistchitietdone.belongsTo(Tb_checklistc, {
  foreignKey: "ID_ChecklistC",
});

// user history
Tb_User_History.belongsTo(Ent_duan, { foreignKey: "ID_Duan" });
Tb_User_History.belongsTo(Ent_chucvu, { foreignKey: "ID_Chucvu" });

// be boi
beboi.belongsTo(Ent_checklist, { foreignKey: "ID_Checklist" });
beboi.belongsTo(Tb_checklistc, { foreignKey: "ID_ChecklistC" });

module.exports = {
  Ent_toanha,
  Ent_duan,
  Ent_khuvuc,
  Ent_khoicv,
  Ent_hangmuc,
  Ent_khuvuc_khoicv,
  Ent_user,
  Ent_calv,
  Ent_chucvu,
  Ent_tang,
  Ent_checklist,
  Ent_ChecklistReplace,
  Tb_checklistc,
  Tb_checklistchitiet,
  Tb_checklistchitietdone,
  Ent_nhom,
  Ent_thietlapca,
  Tb_sucongoai,
  Ent_duan_khoicv,
  Ent_chinhanh,
  Ent_linhvuc,
  Ent_loaihinhbds,
  Ent_phanloaida,
  Ent_Baocaochiso,
  Ent_Loai_Chiso,
  Ent_Hangmuc_Chiso,
  Ent_Hsse_User,
  HSSE_Log,
  P0,
  P0_Log,
  P0_User,
  S0_Thaydoithe,
  S0_Thaydoithe_log,
  Ent_Phanhe,
  Ent_Thamsophanhe,
  Tb_User_History,
  Ent_bansuco,
  Ent_loaisosanh,
  Ent_phanhe,
  beboi,
  Lich_LamViec_PhanHe,
  LB_yeucauKH,
  LB_xulyCV,
  LB_hinhanh,
  Lich_Thangmayct
};
