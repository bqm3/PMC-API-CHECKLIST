const { Sequelize, DataTypes, STRING } = require("sequelize");
const sequelize = require("../config/db.config");

const hsse = sequelize.define(
  "hsse",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Ten_du_an: {
      type: DataTypes.STRING(100),
    },
    Ngay_ghi_nhan: {
      type: DataTypes.STRING(20),
    },
    Nguoi_tao: {
      type: DataTypes.STRING(100),
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    Dien_cu_dan: {
      type: DataTypes.CHAR,
    },
    Dien_cdt: {
      type: DataTypes.CHAR,
    },
    Nuoc_cu_dan: {
      type: DataTypes.CHAR,
    },
    Nuoc_cdt: {
      type: DataTypes.CHAR,
    },
    Xa_thai: {
      type: DataTypes.CHAR,
    },
    Rac_sh: {
      type: DataTypes.CHAR,
    },
    Muoi_dp: {
      type: DataTypes.CHAR,
    },
    PAC: {
      type: DataTypes.CHAR,
    },
    NaHSO3: {
      type: DataTypes.CHAR,
    },
    NaOH: {
      type: DataTypes.CHAR,
    },
    Mat_rd: {
      type: DataTypes.CHAR,
    },
    Polymer_Anion: {
      type: DataTypes.CHAR,
    },
    Chlorine_bot: {
      type: DataTypes.CHAR,
    },
    Chlorine_vien: {
      type: DataTypes.CHAR,
    },
    Methanol: {
      type: DataTypes.CHAR,
    },
    Dau_may: {
      type: DataTypes.CHAR,
    },
    Tui_rac240: {
      type: DataTypes.CHAR,
    },
    Tui_rac120: {
      type: DataTypes.CHAR,
    },
    Tui_rac20: {
      type: DataTypes.CHAR,
    },
    Tui_rac10: {
      type: DataTypes.CHAR,
    },
    Tui_rac5: {
      type: DataTypes.CHAR,
    },
    giayvs_235: {
      type: DataTypes.CHAR,
    },
    giaivs_120: {
      type: DataTypes.CHAR,
    },
    giay_lau_tay: {
      type: DataTypes.CHAR,
    },
    hoa_chat: {
      type: DataTypes.CHAR,
    },
    nuoc_rua_tay: {
      type: DataTypes.CHAR,
    },
    nhiet_do: {
      type: DataTypes.CHAR,
    },
    nuoc_bu: {
      type: DataTypes.CHAR,
    },
    clo: {
      type: DataTypes.CHAR,
    },
    PH: {
      type: DataTypes.CHAR,
    },
    Poolblock: {
      type: DataTypes.CHAR,
    },
    trat_thai: {
      type: DataTypes.CHAR,
    },
    Email: {
      type: DataTypes.STRING(255),
    },
    pHMINUS: {
      type: DataTypes.CHAR,
    },
    axit: {
      type: DataTypes.CHAR,
    },
    PN180: {
      type: DataTypes.CHAR,
    },
    modifiedBy: {
      type: DataTypes.STRING(255),
    },
    chiSoCO2: {
      type: DataTypes.CHAR,
    },
   
  },
  {
    freezeTableName: true,
    timestamps: true,
    tableName: "HSSE",
  }
);


module.exports = hsse;

