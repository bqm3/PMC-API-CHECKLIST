const { Sequelize, DataTypes } = require("sequelize");
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
      type: DataTypes.STRING(255),
    },
    Ngay_ghi_nhan: {
      type: DataTypes.DATE,
    },
    Nguoi_tao: {
      type: DataTypes.STRING(255),
    },
    Created: {
      type: DataTypes.DATE,
    },
    Dien_cu_dan: {
      type: DataTypes.FLOAT,
    },
    Dien_cdt: {
      type: DataTypes.FLOAT,
    },
    Nuoc_cu_dan: {
      type: DataTypes.FLOAT,
    },
    Nuoc_cdt: {
      type: DataTypes.FLOAT,
    },
    Xa_thai: {
      type: DataTypes.FLOAT,
    },
    Rac_sh: {
      type: DataTypes.FLOAT,
    },
    Muoi_dp: {
      type: DataTypes.FLOAT,
    },
    PAC: {
      type: DataTypes.FLOAT,
    },
    NaHSO3: {
      type: DataTypes.FLOAT,
    },
    NaOH: {
      type: DataTypes.FLOAT,
    },
    Mat_rd: {
      type: DataTypes.FLOAT,
    },
    Polymer_Anion: {
      type: DataTypes.FLOAT,
    },
    clorin: {
      type: DataTypes.FLOAT,
    },
    Methanol: {
      type: DataTypes.FLOAT,
    },
    Dau_may: {
      type: DataTypes.FLOAT,
    },
    Tui_rac240: {
      type: DataTypes.FLOAT,
    },
    Tui_rac120: {
      type: DataTypes.FLOAT,
    },
    Tui_rac20: {
      type: DataTypes.FLOAT,
    },
    Tui_rac10: {
      type: DataTypes.FLOAT,
    },
    Tui_rac5: {
      type: DataTypes.FLOAT,
    },
    giayvs_235: {
      type: DataTypes.FLOAT,
    },
    giaivs_120: {
      type: DataTypes.FLOAT,
    },
    giay_lau_tay: {
      type: DataTypes.FLOAT,
    },
    hoa_chat: {
      type: DataTypes.FLOAT,
    },
    nuoc_rua_tay: {
      type: DataTypes.FLOAT,
    },
    nhiet_do: {
      type: DataTypes.FLOAT,
    },
    nuoc_bu: {
      type: DataTypes.FLOAT,
    },
    clo: {
      type: DataTypes.FLOAT,
    },
    PH: {
      type: DataTypes.FLOAT,
    },
    trat_thai: {
      type: DataTypes.FLOAT,
    },
    Email: {
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
