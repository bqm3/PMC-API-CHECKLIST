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
      type: DataTypes.DATEONLY,
      
    },
    Nguoi_tao: {
      type: DataTypes.STRING(255),
      
    },
    Created: {
      type: DataTypes.DATE,
      
    },
    Dien_cu_dan: {
      type: DataTypes.DECIMAL(10, 2),
      
    },
    Dien_cdt: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Nuoc_cu_dan: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Nuoc_cdt: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Xa_thai: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Rac_sh: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Muoi_dp: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    PAC: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    NaHSO3: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    NaOH: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Mat_rd: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Polymer_Anion: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    clorin: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Methanol: {
      type: DataTypes.DECIMAL(10, 2),
      
    },
    Dau_may: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Tui_rac240: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Tui_rac120: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Tui_rac20: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Tui_rac10: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    Tui_rac5: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    giayvs_235: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    giaivs_120: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    giay_lau_tay: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    hoa_chat: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    nuoc_rua_tay: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    nhiet_do: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    nuoc_bu: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    clo: {
      type: DataTypes.DECIMAL(10, 2),
      
    },
    PH: {
      type: DataTypes.DECIMAL(10, 0),
      
    },
    trat_thai: {
      type: DataTypes.DECIMAL(10, 0),
      
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
