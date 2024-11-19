const {
  Ent_nhom,
  Ent_chinhanh,
  Ent_linhvuc,
  Ent_loaihinhbds,
  Ent_phanloaida,
  Ent_duan,
} = require("../models/setup.model");
const hsse = require("../models/hsse.model");
const moment = require("moment");

const sequelize = require("../config/db.config");
const xlsx = require("xlsx");
const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const axios = require("axios");
const { removeSpacesFromKeys } = require("../utils/util");

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

exports.checkDateReportData = async (req, res) => {
  try {
    const today = moment().startOf("day");
    // Chuyển đổi date từ chuỗi thành đối tượng Date
    const inputDate = new Date(today);
    if (isNaN(inputDate)) {
      return res.status(400).json({
        message: "Ngày không hợp lệ.",
      });
    }

    const { ID_Duan } = req.body;
    const duAn = await Ent_duan.findByPk(ID_Duan, {
      where: {
        isDelete: 0,
      },
      include: [
        {
          model: Ent_chinhanh,
          attributes: ["Tenchinhanh", "ID_Chinhanh"],
        },
        {
          model: Ent_nhom,
          attributes: ["Tennhom", "ID_Nhom"],
        },
        {
          model: Ent_phanloaida,
          as: "ent_phanloaida",
          attributes: ["ID_Phanloai", "Phanloai"],
        },
      ],
    });

    // Lấy ngày đầu tiên và ngày cuối cùng của tháng
    const firstDayOfMonth = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth() + 1,
      0
    );

    // Kiểm tra xem ngày có phải là ngày đầu tiên hoặc cuối cùng của tháng không
    const isFirstOrLastDay =
      inputDate.getTime() === firstDayOfMonth.getTime() ||
      inputDate.getTime() === lastDayOfMonth.getTime();

    if (!isFirstOrLastDay) {
      return res.status(400).json({
        message: "Ngày không phải là ngày đầu tiên hoặc cuối cùng của tháng.",
        data: {
          show: false,
          isCheck: duAn?.ID_Phanloai !== 1 ? 0 : 1,
        },
      });
      // return res.status(200).json({
      //   message: "Ngày không phải là ngày đầu tiên hoặc cuối cùng của tháng.",
      //   data: {
      //     month: 12,
      //     year: 2024,
      //     show: true,
      //     isCheck: duAn?.ID_Phanloai !== 1 ? 0 : 1
      //   },
      // });
    }

    // Lấy tháng và năm cuối cùng (nếu là ngày đầu tiên thì lấy tháng trước)
    const finalMonth =
      inputDate.getDate() === 1
        ? inputDate.getMonth()
        : inputDate.getMonth() + 1;
    const finalYear =
      inputDate.getDate() === 1 && finalMonth === 0
        ? inputDate.getFullYear() - 1
        : inputDate.getFullYear();

    return res.status(200).json({
      message: "Ngày hợp lệ.",
      data: {
        month: finalMonth === 0 ? 12 : finalMonth,
        year: finalYear,
        show: true,
        // 1 là trụ sở văn phòng
        isCheck: duAn?.ID_Phanloai !== 1 ? 0 : 1,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

function convertExcelDate(excelDate) {
  // Excel's date system starts at 1900-01-01
  const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel epoch is 1900-01-01
  excelEpoch.setDate(excelEpoch.getDate() + excelDate - 2); // Adjust for Excel's leap year bug

  // Ensure the date is correctly formatted as YYYY-MM-DD without time
  return excelEpoch.toISOString().split("T")[0];
}

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    await sequelize.transaction(async (transaction) => {
      for (const item of data) {
        const tranforItem = removeSpacesFromKeys(item);
        const tenDuAn = tranforItem["TÊN DỰ ÁN"];
        console.log(
          'tranforItem["NGÀY GHI NHẬN"]',
          convertExcelDate(tranforItem["NGÀY GHI NHẬN"])
        );

        const ngayGhiNhan = convertExcelDate(tranforItem["NGÀY GHI NHẬN"]);

        const nguoiTao = tranforItem["NGƯỜI TẠO"];

        const created = convertExcelDate(tranforItem["CREATED"]);

        const dienCuDan = tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CƯ DÂN)"];

        const dienCdt = tranforItem["SỐ ĐIỆN TIÊU THỤ HÔM QUA (CĐT)"];

        const nuocCuDan = tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CƯ DÂN)"];

        const nuocCdt = tranforItem["SỐ NƯỚC TIÊU THỤ HÔM QUA (CĐT)"];

        const nuocXaThai = tranforItem["NƯỚC XẢ THẢI HÔM QUA"];

        const racSinhHoat = tranforItem["RÁC SINH HOẠT HÔM QUA"];

        const tuiRac240 = tranforItem["TÚI ĐỰNG RÁC 240 LIT HÔM QUA"];

        const tuiRac120 = tranforItem["TÚI ĐỰNG RÁC 120 LIT"];

        const tuiRac20 = tranforItem["TÚI ĐỰNG RÁC 20 LIT"];

        const tuiRac10 = tranforItem["TÚI ĐỰNG RÁC 10 LIT"];

        const tuiRac5 = tranforItem["TÚI ĐỰNG RÁC 5 LIT"];

        const giayVs235 = tranforItem["GIẤY VỆ SINH 90X235MM"];

        const giayVs120 = tranforItem["GIẤY VỆ SINH 90X120MM"];

        const giayLauTay = tranforItem["GIẤY LAU TAY"];

        const hoaChat = tranforItem["HÓA CHẤT LÀM SẠCH"];

        const nuocRuaTay = tranforItem["NƯỚC RỬA TAY"];

        const nhietDo = tranforItem["NHIỆT ĐỘ MÔI TRƯỜNG"];

        const nuocBu = tranforItem["NƯỚC BÙ BỂ BƠI"];
        const clo = tranforItem["NỒNG ĐỘ CLO BỂ BƠI"];

        const ph = tranforItem["NỒNG ĐỘ PH BỂ BƠI"];

        const dauMay = tranforItem["DẦU MÁY PHÁT"];

        const tratThai = tranforItem["TRẠT THẢI XÂY DỰNG"];

        const chiSoCo2 = tranforItem["CHỈ SỐ CO2 TẠI TẦNG HẦM"];

        const chlorine90 = tranforItem["CHLORINE 90%"];

        const axitHcl = tranforItem["A XÍT HCL"];
        const chlorine90Vien = tranforItem["CHLORINE 90% (DẠNG VIÊN)"];

        const phMinus = tranforItem["PH MINUS"];

        const poolBlock = tranforItem["POOL BLOCK"];

        const pn180 = tranforItem["PN180"];

        const muoiDienPhan = tranforItem["MUỐI ĐIỆN PHÂN"];

        const pac = tranforItem["PAC"];

        const naHSO3 = tranforItem["NAHSO3"];

        const naOH = tranforItem["NAOH"];

        const matRiDuong = tranforItem["MẬT RỈ ĐƯỜNG"];

        const polymerAnion = tranforItem["POLYMER ANION"];

        const clorin = tranforItem["CLORIN"];

        const methanol = tranforItem["METHANOL"];

        const modified = tranforItem["MODIFIED"];

        const modifiedBy = tranforItem["MODIFIED BY"];

        const email = tranforItem["EMAIL"];

        const newHSSE = await hsse.create(
          {
            Ten_du_an: tenDuAn,
            Ngay_ghi_nhan: ngayGhiNhan,
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
          },
          { transaction }
        );
      }
    });
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
