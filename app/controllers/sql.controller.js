const moment = require("moment");
const {
  Ent_duan,
  Ent_calv,
  Ent_khoicv,
  Tb_checklistc,
  Ent_chucvu,
  Ent_checklist,
  Ent_khuvuc,
  Ent_hangmuc,
  Ent_user,
  Ent_toanha,
  Tb_checklistchitiet,
  Tb_checklistchitietdone,
  Ent_tang,
  Ent_nhom,
  Ent_khuvuc_khoicv,
  Ent_thietlapca,
  Ent_duan_khoicv,
  Tb_sucongoai,
  Ent_chinhanh,
  Ent_phanloaida,
  Ent_linhvuc,
  Ent_loaihinhbds,
} = require("../models/setup.model");
const { Op, Sequelize } = require("sequelize");
const { uploadFile } = require("../middleware/auth_google");
const sequelize = require("../config/db.config");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const defineDynamicModelChiTiet = require("../models/definechecklistchitiet.model");
const { getMonthsRange } = require("../utils/util");
const defineDynamicModelChiTietDone = require("../models/definechecklistchitietdone.model");

exports.query = async (req, res) => {
  try {
    console.log("vao day");
    const records = await Tb_sucongoai.findAll({
      attributes: ["ID_Suco", "ID_Hangmuc", "ID_User"],
      include: [
        {
          model: Ent_user,
          as: "ent_user",
          attributes: ["UserName", "Email", "Hoten", "ID_Duan"],
        },
      ],
    });

    for (const record of records) {
      if (record.ent_user && record.ent_user.ID_Duan) {
        await Tb_sucongoai.update(
          { ID_Duan: record.ent_user.ID_Duan },
          { where: { ID_User: record.ID_User } }
        );
      }
    }
    return res.status(200).json("DONE");
  } catch (error) {
    console.error("Error in query:", error);
    return res.status(500).json({ message: error.message });
  }
};

const ExcelJS = require("exceljs");

exports.checklist = async (req, res) => {
  try {
    const { ID_KhoiCV, ID_Duan, month, year } = req.query;

    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const Ngay = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const table_chitiet = `tb_checklistchitiet_${month}_${year}`;
      const table_done = `tb_checklistchitietdone_${month}_${year}`;

      defineDynamicModelChiTiet(table_chitiet, sequelize);

      const tbChecklistC = await Tb_checklistc.findAll({
        attributes: ["ID_ChecklistC", "Ngay", "ID_Calv", "ID_Duan", "isDelete"],
        where: { Ngay, ID_KhoiCV, isDelete: 0, ID_Duan },
        include: [
          {
            model: Ent_calv,
            attributes: ["Tenca"],
          },
        ],
      });

      if (tbChecklistC.length === 0) continue;

      const checklistCIds = tbChecklistC.map((item) => item.ID_ChecklistC);

      const dataChecklistChiTiet = await sequelize.models[
        table_chitiet
      ].findAll({
        attributes: ["ID_Checklist", "Ketqua", "ID_ChecklistC"],

        where: {
          ID_ChecklistC: { [Op.in]: checklistCIds },
          isDelete: 0,
        },
        include: [
          {
            model: Ent_checklist,
            as: "ent_checklist",
            attributes: ["Checklist", "Giatriloi", "ID_Checklist"],
          },
        ],
      });

      const checklistDoneItems = await sequelize.query(
        `SELECT * FROM ${table_done} WHERE ID_ChecklistC IN (?) AND isDelete = 0`,
        {
          replacements: [checklistCIds],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Format dữ liệu
      tbChecklistC.forEach((checklistC) => {
        const checkedItems = [];

        // Lấy từ bảng chitiet
        dataChecklistChiTiet
          .filter((item) => item.ID_ChecklistC === checklistC.ID_ChecklistC)
          .forEach((item) => {
            checkedItems.push({
              ID_Checklist: item.ID_Checklist,
              TrangThai:
                item.Ketqua === item.ent_checklist.Giatriloi ? "X" : "V",
            });
          });

        // Lấy từ bảng done
        checklistDoneItems
          .filter((item) => item.ID_ChecklistC === checklistC.ID_ChecklistC)
          .forEach((item) => {
            const idChecklists = item.Description.split(",").map(Number);
            idChecklists.forEach((id) => {
              checkedItems.push({
                ID_Checklist: id,
                TrangThai: "V",
              });
            });
          });

        // Thêm vào kết quả
        result.push({
          Ngay: checklistC.Ngay,
          Ca: checklistC.ent_calv?.Tenca || "N/A",
          Checked: checkedItems,
        });
      });
    }

    return res.status(200).json({
      message: "Danh sách checklist theo tháng!",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Có lỗi xảy ra!",
    });
  }
};

exports.testExcel = async (req, res) => {
  try {
    const { ID_KhoiCV, ID_Duan, month, year } = req.query;
    const daysInMonth = new Date(year, month, 0).getDate();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    // Tiêu đề cố định
    sheet.mergeCells("A1:D4");
    sheet.getCell("A1").value = "Báo cáo kiểm tra checklist";

    // Cột khu vực, hạng mục, checklist
    sheet.getCell("A5").value = "Tên khu vực";
    sheet.getCell("B5").value = "Tên hạng mục";
    sheet.getCell("C5").value = "Tên checklist";

    const startCol = 4;

    // Lấy dữ liệu checklist chính
    const tbChecklistC = await Tb_checklistc.findAll({
      attributes: ["ID_ChecklistC", "Ngay", "ID_Calv", "ID_Duan", "isDelete"],
      where: {
        ID_Duan,
        ID_KhoiCV,
        isDelete: 0,
        Ngay: {
          [Op.between]: [`${year}-${month}-01`, `${year}-${month}-${daysInMonth}`],
        },
      },
      include: [{ model: Ent_calv, attributes: ["Tenca"] }],
    });

    // Lấy danh sách ID_ChecklistC
    const checklistCIds = tbChecklistC.map((item) => item.ID_ChecklistC);
    const table_chitiet = `tb_checklistchitiet_${month}_${year}`;
    defineDynamicModelChiTiet(table_chitiet, sequelize);

    // Lấy dữ liệu chi tiết checklist
    const dataChecklistChiTiet = await sequelize.models[table_chitiet].findAll({
      attributes: ["ID_Checklist", "Ketqua", "ID_ChecklistC"],
      where: { ID_ChecklistC: { [Op.in]: checklistCIds }, isDelete: 0 },
      include: [
        {
          model: Ent_checklist,
          as: "ent_checklist",
          attributes: ["Checklist", "Giatriloi", "ID_Checklist"],
        },
      ],
    });

    // Lấy dữ liệu checklist hoàn thành
    const checklistDoneItems = await sequelize.query(
      `SELECT * FROM tb_checklistchitietdone_${month}_${year} WHERE ID_ChecklistC IN (?) AND isDelete = 0`,
      {
        replacements: [checklistCIds],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Chuẩn bị lookup table
    const lookupChecklistByDay = new Map();
    tbChecklistC.forEach((item) => {
      const formattedDay = item.Ngay.split("-").reverse().slice(0, 2).join("/");
      const dayKey = `${formattedDay}-${item.ent_calv?.Tenca || "N/A"}`;
      if (!lookupChecklistByDay.has(dayKey)) {
        lookupChecklistByDay.set(dayKey, []);
      }
      lookupChecklistByDay.get(dayKey).push(item.ID_ChecklistC);
    });

    const statusByDay = {};
    dataChecklistChiTiet.forEach((item) => {
      const checklistCId = item.ID_ChecklistC;
      const checklistStatus = item.Ketqua === item.ent_checklist.Giatriloi ? "X" : "V";

      tbChecklistC.forEach((checklistC) => {
        if (checklistC.ID_ChecklistC === checklistCId) {
          const formattedDay = checklistC.Ngay.split("-").reverse().slice(0, 2).join("/");
          const dayKey = `${formattedDay}-${checklistC.ent_calv?.Tenca || "N/A"}`;
          if (!statusByDay[dayKey]) {
            statusByDay[dayKey] = {};
          }
          statusByDay[dayKey][item.ID_Checklist] = checklistStatus;
        }
      });
    });

    checklistDoneItems.forEach((item) => {
      const idChecklists = item.Description.split(",").map(Number);
      idChecklists.forEach((id) => {
        tbChecklistC.forEach((checklistC) => {
          const formattedDay = checklistC.Ngay.split("-").reverse().slice(0, 2).join("/");
          const dayKey = `${formattedDay}-${checklistC.ent_calv?.Tenca || "N/A"}`;
          if (!statusByDay[dayKey]) {
            statusByDay[dayKey] = {};
          }
          statusByDay[dayKey][id] = "V";
        });
      });
    });

    // Lấy dữ liệu ca làm việc
    const dataCalv = await Ent_calv.findAll({
      attributes: ["ID_Calv", "ID_KhoiCV", "ID_Duan", "Tenca", "isDelete"],
      include: [{ model: Ent_khoicv, attributes: ["KhoiCV", "ID_KhoiCV"] }],
      where: { ID_Duan, ID_KhoiCV, isDelete: 0 },
    });

    // Thêm tiêu đề ngày và ca
    for (let day = 1; day <= daysInMonth; day++) {
      const col = startCol + (day - 1) * dataCalv.length;
      sheet.mergeCells(5, col, 5, col + dataCalv.length - 1);
      sheet.getCell(5, col).value = `${day.toString().padStart(2, "0")}/${month}`.slice(-5);
      dataCalv.forEach((ca, index) => {
        sheet.getCell(6, col + index).value = ca.Tenca;
      });
    }

    // Lấy danh sách checklist
    const dataChecklistAll = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Tang",
        "ID_Hangmuc",
        "Checklist",
        "Giatridinhdanh",
        "Giatriloi",
        "isCheck",
        "Giatrinhan",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "isDelete"],
          where: { isDelete: 0 },
        },
        {
          model: Ent_khuvuc,
          attributes: ["Tenkhuvuc", "isDelete"],
          where: { isDelete: 0 },
          include: [
            {
              model: Ent_toanha,
              attributes: ["Toanha", "ID_Toanha", "ID_Duan"],
              where: { ID_Duan: ID_Duan },
            },
            {
              model: Ent_khuvuc_khoicv,
              attributes: ["ID_KV_CV", "ID_Khuvuc", "ID_KhoiCV"],
              include: [{ model: Ent_khoicv, attributes: ["KhoiCV"] }],
              where: { ID_KhoiCV: ID_KhoiCV },
            },
          ],
        },
      ],
      where: { isDelete: 0 },
    });

    // Thêm dữ liệu checklist vào Excel
    let rowIndex = 7;
    dataChecklistAll.forEach((checklist) => {
      sheet.getCell(`A${rowIndex}`).value = checklist.ent_khuvuc.Tenkhuvuc;
      sheet.getCell(`B${rowIndex}`).value = checklist.ent_hangmuc.Hangmuc;
      sheet.getCell(`C${rowIndex}`).value = checklist.Checklist;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${day.toString().padStart(2, "0")}/${month}`.slice(-5);
        dataCalv.forEach((ca, index) => {
          const key = `${dayKey}-${ca.Tenca}`;
          const status = statusByDay[key]?.[checklist.ID_Checklist] || "";

          const col = startCol + (day - 1) * dataCalv.length;
          const cell = sheet.getCell(rowIndex, col + index);
          cell.value = status;

          if (status === "V") {
            cell.value = "✔"; // Icon tích xanh (✔ - U+2714)
            cell.fill = { type: "pattern", pattern: "solid" ,fgColor: { argb: "FFCCFFCC" }};
            cell.font = {
              bold: true,
              color: { argb: "FF008000" }, // Màu chữ xanh đậm
            };
          } else if (status === "X") {
            cell.value = "✘"; // Icon tích đỏ (✘ - U+2718)
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE6E6" } };
          } else {
            cell.value = ""; // Trạng thái rỗng
          }
        });
      }
      rowIndex++;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Checklist_Report.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
