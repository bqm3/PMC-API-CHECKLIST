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


