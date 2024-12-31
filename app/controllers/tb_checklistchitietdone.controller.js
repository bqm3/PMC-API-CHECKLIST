const {
  Tb_checklistchitietdone,
  Tb_checklistc,
  Ent_checklist,
} = require("../models/setup.model");
const sequelize = require("../config/db.config");
const { Op, Sequelize } = require("sequelize");
const { sendToQueueDone } = require("../queue/producer.checklist");
const moment = require('moment');


const insertIntoDynamicTable = async (tableName, data, transaction) => {
  await sequelize.query(
    `
    INSERT INTO ${tableName} 
      (ID_ChecklistC, Description, Gioht, Vido, Kinhdo, Docao, isScan, isCheckListLai, isDelete)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    {
      replacements: [
        data.ID_ChecklistC,
        data.Description,
        data.Gioht,
        data.Vido,
        data.Kinhdo,
        data.Docao,
        data.isScan,
        data.isCheckListLai,
        0,
      ],
      transaction,
    }
  );
};

exports.create = async (req, res) => {
  const transaction = await sequelize.transaction(); // Mở giao dịch

  try {
    const userData = req.user.data;

    if (!userData) {
      return res.status(401).json({
        message: "Bạn không có quyền tạo dự án!",
      });
    }

    const {
      ID_Checklists,
      Description,
      checklistLength,
      ID_ChecklistC,
      Vido,
      Kinhdo,
      Docao,
      Gioht,
      isScan,
      isCheckListLai,
    } = req.body;

    // Kiểm tra đầu vào
    if (!Description || !Gioht) {
      return res.status(400).json({
        message: "Không thể checklist dữ liệu!",
      });
    }

    const data = {
      ID_ChecklistC: ID_ChecklistC || null,
      Description: Description || "",
      Gioht,
      Vido: Vido || null,
      Kinhdo: Kinhdo || null,
      Docao: Docao || null,
      isScan: isScan || null,
      isCheckListLai: isCheckListLai === 1 ? 1 : 0,
      isDelete: 0,
    };
    const currentDate = moment();
    const cutoffDate = moment("2024-12-31", "YYYY-MM-DD");
    // Tạo bảng động nếu chưa tồn tại
    const dynamicTableName = `tb_checklistchitietdone_${
      (new Date().getMonth() + 1).toString().padStart(2, '0')
    }_${new Date().getFullYear()}`;
    // const dynamicTableName = "tb_checklistchitietdone_01_2025"

    if (currentDate.isAfter(cutoffDate)) {
      // Nếu ngày hiện tại > 31/12/2024, chỉ chèn vào Dynamic Table
      await insertIntoDynamicTable(dynamicTableName, data, transaction);
    } else {
      // Nếu ngày hiện tại <= 31/12/2024, chèn cả hai
      await insertIntoDynamicTable(dynamicTableName, data, transaction);
      await Tb_checklistchitietdone.create(data, {
        transaction,
      });
    }

    // Commit giao dịch
    await transaction.commit();

    res.status(200).json({
      message: "Checklist thành công!",
    });

    const backgroundTask = {
      records: {
        ...data,
        checklistLength,
        ID_Checklists,
      },
      dynamicTableName,
    };
    await sendToQueueDone(backgroundTask);

    // // Cập nhật `TongC` trong `Tb_checklistc`
    // if (ID_ChecklistC) {
    //   const checklistC = await Tb_checklistc.findOne({
    //     attributes: ["ID_ChecklistC", "TongC", "Tong"],
    //     where: { ID_ChecklistC },
    //     transaction,
    //   });

    //   if (checklistC) {
    //     const { TongC, Tong } = checklistC;
    //     if (TongC < Tong && data.isCheckListLai === 0) {
    //       await Tb_checklistc.update(
    //         { TongC: Sequelize.literal(`TongC + ${checklistLength}`) },
    //         { where: { ID_ChecklistC }, transaction }
    //       );
    //     }
    //   }
    // }

    // // Cập nhật `Tinhtrang` trong `Ent_checklist`
    // if (ID_Checklists && ID_Checklists.length > 0) {
    //   await Ent_checklist.update(
    //     { Tinhtrang: 0 },
    //     { where: { ID_Checklist: { [Op.in]: ID_Checklists } }, transaction }
    //   );
    // }
  } catch (error) {
    // Rollback giao dịch nếu có lỗi
    await transaction.rollback();
    console.error("Error details:", error);
    return res.status(500).json({
      error: error.message || "Đã xảy ra lỗi trong quá trình checklist",
    });
  }
};

exports.getDataFormat = async (req, res) => {
  try {
    const checklistDoneItems = await Tb_checklistchitietdone.findAll({
      attributes: ["Description", "Gioht", "ID_ChecklistC"],
      where: { isDelete: 0 },
    });

    const arrPush = [];

    checklistDoneItems.forEach((item) => {
      const idChecklists = item.Description.split(",").map(Number);
      if (idChecklists.length > 0) {
        idChecklists.map((it) => {
          if (Number(item.ID_ChecklistC) === Number(req.params.idc)) {
            arrPush.push({
              ID_ChecklistC: parseInt(item.ID_ChecklistC),
              ID_Checklist: it,
              Gioht: item.Gioht,
            });
          }
        });
      }
    });

    // Trả về dữ liệu hoặc thực hiện các thao tác khác ở đây
    res.status(200).json(arrPush);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
