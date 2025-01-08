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
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  const { ID_KhoiCV, ID_Duan, month, year } = req.query;

  const daysInMonth = new Date(year, month, 0).getDate();

  const whereCondition = {
    isDelete: 0,
  };

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
        where: {
          isDelete: 0,
        },
      },
      {
        model: Ent_khuvuc,
        attributes: ["Tenkhuvuc", "isDelete"],
        where: {
          isDelete: 0,
        },
        include: [
          {
            model: Ent_toanha,
            attributes: ["Toanha", "ID_Toanha", "ID_Duan"],
          },
          {
            model: Ent_khuvuc_khoicv,
            attributes: ["ID_KV_CV", "ID_Khuvuc", "ID_KhoiCV"],
            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
              },
            ],
          },
        ],
      },
    ],
    where: whereCondition,
  });

  const dataCalv = await Ent_calv.findAll({
    attributes: ["ID_Calv", "ID_KhoiCV", "ID_Duan", "Tenca", "isDelete"],
    include: [
      {
        model: Ent_khoicv,
        attributes: ["KhoiCV", "ID_KhoiCV"],
      },
    ],
    where: {
      ID_Duan: ID_Duan,
      ID_KhoiCV: ID_KhoiCV,
      isDelete: 0,
    },
  });

  // Tiêu đề cố định
  sheet.mergeCells("A1:D4");
  sheet.getCell("A1").value = "Báo cáo kiểm tra checklist";

  // Cột khu vực, hạng mục, checklist
  sheet.getCell("A5").value = "Tên khu vực";
  sheet.getCell("B5").value = "Tên hạng mục";
  sheet.getCell("C5").value = "Tên checklist";

  const startCol = 4;

  let result = [];
  // Thêm tiêu đề ngày và ca
  for (let day = 1; day <= daysInMonth; day++) {
    const col = startCol + (day - 1) * dataCalv.length; // Số cột bắt đầu cho mỗi ngày
    sheet.mergeCells(5, col, 5, col + dataCalv.length - 1); // Merge các cột cho ngày
    sheet.getCell(5, col).value = `${day
      .toString()
      .padStart(2, "0")}/${month}`.slice(-5); // Ngày
    dataCalv.forEach((ca, index) => {
      sheet.getCell(6, col + index).value = ca.Tenca; // Chèn tên ca
    });

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

    const dataChecklistChiTiet = await sequelize.models[table_chitiet].findAll({
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
            TrangThai: item.Ketqua === item.ent_checklist.Giatriloi ? "X" : "V",
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

  // Thêm dữ liệu checklist vào Excel
  let rowIndex = 7; // Bắt đầu từ dòng 7
  dataChecklistAll.forEach((checklist) => {
    // Cột A, B, C: Khu vực, Hạng mục, Checklist
    sheet.getCell(`A${rowIndex}`).value = checklist.ent_khuvuc.Tenkhuvuc;
    sheet.getCell(`B${rowIndex}`).value = checklist.ent_hangmuc.Hangmuc;
    sheet.getCell(`C${rowIndex}`).value = checklist.Checklist;

    // Cột trạng thái cho từng ngày/ca
    for (let day = 1; day <= daysInMonth; day++) {
      const col = startCol + (day - 1) * dataCalv.length; // Tính cột bắt đầu của ngày
      const dayKey = `${day.toString().padStart(2, "0")}/${month}`.slice(-5); // Key ngày cần tìm
      dataCalv.forEach((ca, index) => {
        const caData = result.find((item) => {
          const formattedDay = item.Ngay.split("-").reverse().slice(0, 2).join("/");
          return formattedDay == dayKey && item.Ca == ca.Tenca;
        });
        const status =
          caData?.Checked.find(
            (item) => item.ID_Checklist === checklist.ID_Checklist
          )?.TrangThai || "";

          console.log('status', status)
        const cell = sheet.getCell(rowIndex, col + index);
        cell.value = status;

        // Thêm màu sắc theo trạng thái
        if (status === "V") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Xanh
          };
        } else if (status === "X") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" }, // Đỏ
          };
        }
      });
    }

    rowIndex++;
  });

  const buffer = await workbook.xlsx.writeBuffer(); // Ghi file vào buffer
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Checklist_Report.xlsx"
  );
  res.send(buffer); // Gửi buffer trực tiếp cho người dùng
};
