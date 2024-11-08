const {
  Ent_nhom,
  Ent_chinhanh,
  Ent_linhvuc,
  Ent_loaihinhbds,
  Ent_phanloaida,
} = require("../models/setup.model");
const hsse = require("../models/hsse.model");

const sequelize = require("../config/db.config");
const xlsx = require("xlsx");
const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const axios = require("axios");

exports.getNhom = async (req, res) => {
  try {
    await Ent_nhom.findAll({
      attributes: ["ID_Nhom", "Tennhom", "isDelete"],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Danh sách",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getChinhanh = async (req, res) => {
  try {
    await Ent_chinhanh.findAll({
      attributes: ["ID_Chinhanh", "Tenchinhanh", "isDelete"],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Danh sách",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getLinhvuc = async (req, res) => {
  try {
    await Ent_linhvuc.findAll({
      attributes: ["ID_Linhvuc", "Linhvuc", "isDelete"],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Danh sách",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
exports.getLoaihinh = async (req, res) => {
  try {
    await Ent_loaihinhbds.findAll({
      attributes: ["ID_Loaihinh", "Loaihinh", "isDelete"],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Danh sách",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getPhanloai = async (req, res) => {
  try {
    await Ent_phanloaida.findAll({
      attributes: ["ID_Phanloai", "Phanloai", "isDelete"],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Danh sách",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const removeSpacesFromKeys = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = key?.toUpperCase();
    acc[newKey] = obj[key];
    return acc;
  }, {});
};

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    for (const item of data) {
    await sequelize.transaction(async (transaction) => {
        const tranforItem = removeSpacesFromKeys(item);
        const tenDuAn =
          tranforItem["TÊN DỰ ÁN"] !== undefined
            ? tranforItem["TÊN DỰ ÁN"]
            : null;
        const ngayGhiNhan =
          tranforItem["NGÀY GHI NHẬN"] !== undefined
            ? tranforItem["NGÀY GHI NHẬN"]
            : null;
        const nguoiTao =
          tranforItem["NGƯỜI TẠO"] !== undefined
            ? tranforItem["NGƯỜI TẠO"]
            : null;
        const created =
          tranforItem["CREATED"] !== undefined
            ? tranforItem["CREATED"]
            : null;
        const dienCuDan =
          tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CƯ DÂN)"] !== undefined
            ? tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CƯ DÂN)"]
            : null;
        const dienCdt =
          tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CĐT)"] !== undefined
            ? tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CĐT)"]
            : null;
        const nuocCuDan =
          tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CƯ DÂN)"] !== undefined
            ? tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CƯ DÂN)"]
            : null;
        const nuocCdt =
          tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CĐT)"] !== undefined
            ? tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CĐT)"]
            : null;
        const nuocXaThai =
          tranforItem["NƯỚC XẢ THẢI HÔM QUA"] !== undefined
            ? tranforItem["NƯỚC XẢ THẢI HÔM QUA"]
            : null;
        const racSinhHoat =
          tranforItem["RÁC SINH HOẠT HÔM QUA"] !== undefined
            ? tranforItem["RÁC SINH HOẠT HÔM QUA"]
            : null;
        const tuiRac240 =
          tranforItem["TÚI ĐỰNG RÁC 240 LIT HÔM QUA"] !== undefined
            ? tranforItem["TÚI ĐỰNG RÁC 240 LIT HÔM QUA"]
            : null;
        const tuiRac120 =
          tranforItem["TÚI ĐỰNG RÁC 120 LIT"] !== undefined
            ? tranforItem["TÚI ĐỰNG RÁC 120 LIT"]
            : null;
        const tuiRac20 =
          tranforItem["TÚI ĐỰNG RÁC 20 LIT"] !== undefined
            ? tranforItem["TÚI ĐỰNG RÁC 20 LIT"]
            : null;
        const tuiRac10 =
          tranforItem["TÚI ĐỰNG RÁC 10 LIT"] !== undefined
            ? tranforItem["TÚI ĐỰNG RÁC 10 LIT"]
            : null;
        const tuiRac5 =
          tranforItem["TÚI ĐỰNG RÁC 5 LIT"] !== undefined
            ? tranforItem["TÚI ĐỰNG RÁC 5 LIT"]
            : null;
        const giayVs235 =
          tranforItem["GIẤY VỆ SINH 90X235MM"] !== undefined
            ? tranforItem["GIẤY VỆ SINH 90X235MM"]
            : null;
        const giayVs120 =
          tranforItem["GIẤY VỆ SINH 90X120MM"] !== undefined
            ? tranforItem["GIẤY VỆ SINH 90X120MM"]
            : null;
        const giayLauTay =
          tranforItem["GIẤY LAU TAY"] !== undefined
            ? tranforItem["GIẤY LAU TAY"]
            : null;
        const hoaChat =
          tranforItem["HÓA CHẤT LÀM SẠCH"] !== undefined
            ? tranforItem["HÓA CHẤT LÀM SẠCH"]
            : null;
        const nuocRuaTay =
          tranforItem["NƯỚC RỬA TAY"] !== undefined
            ? tranforItem["NƯỚC RỬA TAY"]
            : null;
        const nhietDo =
          tranforItem["NHIỆT ĐỘ MÔI TRƯỜNG"] !== undefined
            ? tranforItem["NHIỆT ĐỘ MÔI TRƯỜNG"]
            : null;
        const nuocBu =
          tranforItem["NƯỚC BÙ BỂ BƠI"] !== undefined
            ? tranforItem["NƯỚC BÙ BỂ BƠI"]
            : null;
        const clo =
          tranforItem["NỒNG ĐỘ CLO BỂ BƠI"] !== undefined
            ? tranforItem["NỒNG ĐỘ CLO BỂ BƠI"]
            : null;
        const ph =
          tranforItem["NỒNG ĐỘ PH BỂ BƠI"] !== undefined
            ? tranforItem["NỒNG ĐỘ PH BỂ BƠI"]
            : null;
        const dauMay =
          tranforItem["DẦU MÁY PHÁT"] !== undefined
            ? tranforItem["DẦU MÁY PHÁT"]
            : null;
        const tratThai =
          tranforItem["TRẠT THẢI XÂY DỰNG"] !== undefined
            ? tranforItem["TRẠT THẢI XÂY DỰNG"]
            : null;
        const chiSoCo2 =
          tranforItem["CHỈ SỐ CO2 TẠI TẦNG HẦM"] !== undefined
            ? tranforItem["CHỈ SỐ CO2 TẠI TẦNG HẦM"]
            : null;
        const chlorine90 =
          tranforItem["CHLORINE 90%"] !== undefined
            ? tranforItem["CHLORINE 90%"]
            : null;
        const axitHcl =
          tranforItem["A XÍT HCL"] !== undefined
            ? tranforItem["A XÍT HCL"]
            : null;
        const chlorine90Vien =
          tranforItem["CHLORINE 90% (DẠNG VIÊN)"] !== undefined
            ? tranforItem["CHLORINE 90% (DẠNG VIÊN)"]
            : null;
        const phMinus =
          tranforItem["PH MINUS"] !== undefined
            ? tranforItem["PH MINUS"]
            : null;
        const poolBlock =
          tranforItem["POOL BLOCK"] !== undefined
            ? tranforItem["POOL BLOCK"]
            : null;
        const pn180 =
          tranforItem["PN180"] !== undefined
            ? tranforItem["PN180"]
            : null;
        const muoiDienPhan =
          tranforItem["MUỐI ĐIỆN PHÂN"] !== undefined
            ? tranforItem["MUỐI ĐIỆN PHÂN"]
            : null;
        const pac =
          tranforItem!== undefined ? item["PAC"] : null;
        const naHSO3 =
          tranforItem["NAHSO3"] !== undefined
            ? tranforItem["NAHSO3"]
            : null;
        const naOH =
          tranforItem["NAOH"] !== undefined
            ? tranforItem["NAOH"]
            : null;
        const matRiDuong =
          tranforItem["MẬT RỈ ĐƯỜNG"] !== undefined
            ? tranforItem["MẬT RỈ ĐƯỜNG"]
            : null;
        const polymerAnion =
          tranforItem["POLYMER ANION"] !== undefined
            ? tranforItem["POLYMER ANION"]
            : null;
        const clorin =
          tranforItem["CLORIN"] !== undefined
            ? tranforItem["CLORIN"]
            : null;
        const methanol =
          tranforItem["METHANOL"] !== undefined
            ? tranforItem["METHANOL"]
            : null;
        const modified =
          tranforItem["MODIFIED"] !== undefined
            ? tranforItem["MODIFIED"]
            : null;
        const modifiedBy =
          tranforItem["MODIFIED BY"] !== undefined
            ? tranforItem["MODIFIED BY"]
            : null;
        const email =
          tranforItem["EMAIL"] !== undefined
            ? tranforItem["EMAIL"]
            : null;
        const newHSSE = await hsse.create({
          Ten_du_an: tenDuAn,
          Ngay_ghi_nhan: ngayGhiNhan ? `${ngayGhiNhan} 00:00:00` : null,
          Nguoi_tao: nguoiTao,
          Created: created,
          Dien_cu_dan: dienCuDan,
          Dien_cdt: dienCdt,
          Nuoc_cu_dan: nuocCuDan,
          Nuoc_cdt: nuocCdt,
          Xa_thai: nuocXaThai,
          Rac_sh: racSinhHoat,
          Tui_rac240: tuiRac240,
          Tui_rac120: tuiRac120,
          Tui_rac20: tuiRac20,
          Tui_rac10: tuiRac10,
          Tui_rac5: tuiRac5,
          giayvs_235: giayVs235,
          giaivs_120: giayVs120,
          giay_lau_tay: giayLauTay,
          hoa_chat: hoaChat,
          nuoc_rua_tay: nuocRuaTay,
          nhiet_do: nhietDo,
          nuoc_bu: nuocBu,
          clo: clo,
          PH: ph,
          dau_may: dauMay,
          trat_thai: tratThai,
          chiSoCO2: chiSoCo2,
          chlorine90: chlorine90,
          axitHcl: axitHcl,
          chlorine90Vien: chlorine90Vien,
          phMinus: phMinus,
          poolBlock: poolBlock,
          pn180: pn180,
          muoiDienPhan: muoiDienPhan,
          pac: pac,
          naHSO3: naHSO3,
          naOH: naOH,
          matRiDuong: matRiDuong,
          polymerAnion: polymerAnion,
          clorin: clorin,
          methanol: methanol,
          modified: modified,
          modifiedBy: modifiedBy,
          Email: email,
        },  { transaction });
      }
    )}

    res.send({
      message: "File uploaded and data processed successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
