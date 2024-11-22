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

function convertExcelDateTime(excelDate) {
  console.log('excelDate',excelDate)
  // Excel epoch starts from 1900-01-01
  const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  const days = Math.floor(excelDate); // Phần nguyên: số ngày
  const fractionalDay = excelDate - days; // Phần thập phân: thời gian trong ngày

  excelEpoch.setDate(excelEpoch.getDate() + days - 2); // Điều chỉnh Excel leap year bug
  console.log('excelEpoch', excelEpoch)

  // Tính giờ, phút, giây từ phần thập phân
  const totalSecondsInDay = Math.round(fractionalDay * 86400); // Tổng số giây trong ngày
  const hours = Math.floor(totalSecondsInDay / 3600);
  const minutes = Math.floor((totalSecondsInDay % 3600) / 60);
  const seconds = totalSecondsInDay % 60;

  // Định dạng ngày giờ đầy đủ
  const year = excelEpoch.getUTCFullYear();
  const month = String(excelEpoch.getUTCMonth() + 1).padStart(2, "0");
  const day = String(excelEpoch.getUTCDate()).padStart(2, "0");
  const hour = String(hours).padStart(2, "0");
  const minute = String(minutes).padStart(2, "0");
  const second = String(seconds).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

const convertExcelDate = (excelDate) => {
  const excelStartDate = new Date(1900, 0, 1); // Excel bắt đầu từ 01/01/1900
  const days = Math.floor(excelDate); // Phần nguyên là số ngày
  const timeFraction = excelDate - days; // Phần thập phân là giờ, phút, giây

  console.log('timeFraction', timeFraction)

  const date = new Date(excelStartDate.getTime() + days * 86400000); // 86400000ms = 1 ngày
  const hours = Math.floor(timeFraction * 24); // Tính giờ
  const minutes = Math.floor((timeFraction * 24 * 60) % 60); // Tính phút
  const seconds = Math.floor((timeFraction * 24 * 60 * 60) % 60); // Tính giây

  // Set giờ, phút, giây vào ngày
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);

  // Trả về ngày theo định dạng YYYY-MM-DD
  const formattedDate = date.toISOString().slice(0, 10); // Chỉ lấy phần ngày (YYYY-MM-DD)
  return formattedDate;
};

exports.uploadFiles = async (req, res) => {
  let index = 0;
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    await sequelize.transaction(async (transaction) => {
      const uppercaseKeys = (obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const newKey = key.toUpperCase();
          acc[newKey] = obj[key];
          return acc;
        }, {});
      };

      for (const item of data) {
        index++;
        try {

          const tranforItem = uppercaseKeys(item);
          const ngayGhiNhan = convertExcelDate(item["Ngày ghi nhận"]);
          const tenDuAn = tranforItem["TÊN DỰ ÁN"];
          const nguoiTao = tranforItem["NGƯỜI TẠO"];
          const created = convertExcelDateTime(item["Created"]);
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
          const methanol = tranforItem["METHANOL"];
          const modified = convertExcelDateTime(item["Modified"]);
          const modifiedBy = tranforItem["MODIFIED BY"];
          const email = tranforItem["EMAIL"];

          const newHSSE = await hsse.create(
            {
              Ten_du_an: tenDuAn == "NaN" ? null : tenDuAn,
              Ngay_ghi_nhan: ngayGhiNhan == "NaN" ? null : ngayGhiNhan,
              Nguoi_tao: nguoiTao == "NaN" ? null : nguoiTao,
              Dien_cu_dan: dienCuDan == "NaN" ? null : dienCuDan,
              Dien_cdt: dienCdt == "NaN" ? null : dienCdt,
              Nuoc_cu_dan: nuocCuDan == "NaN" ? null : nuocCuDan,
              Nuoc_cdt: nuocCdt == "NaN" ? null : nuocCdt,
              Xa_thai: nuocXaThai == "NaN" ? null : nuocXaThai,
              Rac_sh: racSinhHoat == "NaN" ? null : racSinhHoat,
              Muoi_dp: muoiDienPhan == "NaN" ? null : muoiDienPhan,
              Pac: pac == "NaN" ? null : pac,
              NaHSO3: naHSO3 == "NaN" ? null : naHSO3,
              NaOH: naOH == "NaN" ? null : naOH,
              Mat_rd: matRiDuong == "NaN" ? null : matRiDuong,
              Polymer_Anion: polymerAnion == "NaN" ? null : polymerAnion,
              Chlorine_bot: chlorine90 == "NaN" ? null : chlorine90,
              Chlorine_vien: chlorine90Vien == "NaN" ? null : chlorine90Vien,
              Methanol: methanol == "NaN" ? null : methanol,
              Dau_may: dauMay == "NaN" ? null : dauMay,
              Tui_rac240: tuiRac240 == "NaN" ? null : tuiRac240,
              Tui_rac120: tuiRac120 == "NaN" ? null : tuiRac120,
              Tui_rac20: tuiRac20 == "NaN" ? null : tuiRac20,
              Tui_rac10: tuiRac10 == "NaN" ? null : tuiRac10,
              Tui_rac5: tuiRac5 == "NaN" ? null : tuiRac5,
              giayvs_235: giayVs235 == "NaN" ? null : giayVs235,
              giaivs_120: giayVs120 == "NaN" ? null : giayVs120,
              giay_lau_tay: giayLauTay == "NaN" ? null : giayLauTay,
              hoa_chat: hoaChat == "NaN" ? null : hoaChat,
              nuoc_rua_tay: nuocRuaTay == "NaN" ? null : nuocRuaTay,
              nhiet_do: nhietDo == "NaN" ? null : nhietDo,
              nuoc_bu: nuocBu == "NaN" ? null : nuocBu,
              clo: clo == "NaN" ? null : clo,
              PH: ph == "NaN" ? null : ph,
              Poolblock: poolBlock == "NaN" ? null : poolBlock,
              trat_thai: tratThai == "NaN" ? null : tratThai,
              Email: email == "NaN" ? null : email,
              pHMINUS: phMinus == "NaN" ? null : phMinus,
              axit: axitHcl == "NaN" ? null : axitHcl,
              PN180: pn180 == "NaN" ? null : pn180,
              modifiedBy: modifiedBy == "NaN" ? null : modifiedBy,
              chiSoCO2: chiSoCo2 == "NaN" ? null : chiSoCo2,
              updatedAt: modified == "NaN" ? null : modified,
              createdAt: created == "NaN" ? null : created,
            },
            { transaction }
          );
        } catch (err) {
          console.error("Error processing item:", item, "Error:", err);
          throw `${err} item : ${item} index: ${index}`; // Rethrow error to exit transaction on failure
        }
      }
    });

    res.send({
      message: "File uploaded and data processed successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || `Lỗi! Vui lòng thử lại sau. ${index}`,
    });
  }
};
