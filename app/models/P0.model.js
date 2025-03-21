const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const P0 = sequelize.define(
  "P0",
  {
    ID_P0: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ID_Duan: {
      type: DataTypes.INTEGER,
    },
    ID_User_AN: {
      type: DataTypes.INTEGER,
    },
    Ngaybc: {
      type: DataTypes.DATEONLY,
    },
    Slxeoto: {
      type: DataTypes.INTEGER,
    },
    Slxeotodien: {
      type: DataTypes.INTEGER,
    },
    Slxemay: {
      type: DataTypes.INTEGER,
    },
    Slxemaydien: {
      type: DataTypes.INTEGER,
    },
    Slxedap: {
      type: DataTypes.INTEGER,
    },
    Slxedapdien: {
      type: DataTypes.INTEGER,
    },
    Sotheotodk: {
      type: DataTypes.INTEGER,
    },
    Sothexemaydk: {
      type: DataTypes.INTEGER,
    },
    Sltheoto: {
      type: DataTypes.INTEGER,
    },
    Slthexemay: {
      type: DataTypes.INTEGER,
    },
    Sltheotophanmem: {
      type: DataTypes.INTEGER,
    },
    Slthexemayphanmem: {
      type: DataTypes.INTEGER,
    },
    Slscoto: {
      type: DataTypes.INTEGER,
    },
    Slscotodien: {
      type: DataTypes.INTEGER,
    },
    Slscxemay: {
      type: DataTypes.INTEGER,
    },
    Slscxemaydien: {
      type: DataTypes.INTEGER,
    },
    Slscxedap: {
      type: DataTypes.INTEGER,
    },
    Slscxedapdien: {
      type: DataTypes.INTEGER,
    },
    Slcongto: {
      type: DataTypes.INTEGER,
    },
    Doanhthu: {
      type: DataTypes.DOUBLE,
    },
    QuansoTT: {
      type: DataTypes.INTEGER,
    },
    QuansoDB: {
      type: DataTypes.INTEGER,
    },
    Slsucokhac: {
      type: DataTypes.INTEGER,
    },
    iTrangthai: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    Ghichu: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    ID_User_KT: {
      type: DataTypes.INTEGER,
    },
    ID_User_DV: {
      type: DataTypes.INTEGER,
    },
    isDelete: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "P0", 
    timestamps: true, 
    freezeTableName: true, 
  }
);

module.exports = P0;
