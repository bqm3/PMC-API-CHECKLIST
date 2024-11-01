const {
  Tb_checklistchitiet,
  Tb_checklistc,
  Ent_khoicv,
  Ent_checklist,
  Ent_duan,
  Ent_calv,
  Tb_checklistchitietdone,
  Ent_user,
} = require("../models/setup.model");
const { Op, Sequelize, fn, col, literal, where } = require("sequelize");
const sequelize = require("../config/db.config");
const xlsx = require("xlsx");
const e = require("express");
const fs = require("fs");
const moment = require("moment");

exports.tiLeHoanThanh = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const khoi = req.query.khoi || "all";
    const nhom = req.query.nhom || "all";
    const tangGiam = req.query.tangGiam || "desc";

    let whereClause = {
      isDelete: 0,
      ID_Duan: {
        [Op.ne]: 1,
      },
    };

    const getLastDayOfMonth = (year, month) => {
      return new Date(year, month, 0).getDate(); // Get the last day of the given month
    };

    if (khoi !== "all") {
      whereClause.ID_KhoiCV = khoi;
    }

    if (nhom !== "all") {
      whereClause["$ent_duan.ID_Phanloai$"] = nhom;
    }

    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

    whereClause.Ngay = {
      [Op.gte]: `${yesterday} 00:00:00`,
      [Op.lte]: `${yesterday} 23:59:59`,
    };

    const relatedChecklists = await Tb_checklistc.findAll({
      attributes: [
        "ID_ChecklistC",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_Calv",
        "ID_User",
        "Ngay",
        "TongC",
        "Tong",
        "isDelete",
      ],
      where: whereClause,
      include: [
        {
          model: Ent_duan,
          attributes: ["Duan", "ID_Nhom", "ID_Phanloai", "isDelete"],
          where: {
            isDelete: 0,
          },
        },
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV", "isDelete"],
          where: {
            isDelete: 0,
          },
        },
        {
          model: Ent_calv,
          attributes: ["Tenca", "isDelete"],
          where: {
            isDelete: 0,
          },
        },
        {
          model: Ent_user,
          attributes: ["UserName", "isDelete", "Hoten"],
          where: {
            isDelete: 0,
          },
        },
        {
          model: Tb_checklistchitiet,
          as: "tb_checklistchitiets",
          attributes: [
            "ID_Checklistchitiet",
            "ID_Checklist",
            "ID_ChecklistC",
            "Gioht",
            "Ketqua",
            "Ngay",
            "Kinhdo",
            "Vido",
            "Docao",
            "Ghichu",
            "isDelete",
          ],
          where: {
            isDelete: 0,
          },
          include: [
            {
              model: Ent_checklist,
              as: "ent_checklist",
              attributes: ["ID_Checklist", "Checklist", "isDelete"],
              where: {
                isDelete: 0,
              },
            },
          ],
        },
        {
          model: Tb_checklistchitietdone,
          as: "tb_checklistchitietdones",
          attributes: [
            "ID_ChecklistC",
            "Description",
            "Gioht",
            "Kinhdo",
            "Vido",
            "Docao",
          ],
          where: {
            isDelete: 0,
          },
        },
      ],
    });

    // Create a dictionary to group data by project, khối, and ca
    // const result = {};

    // relatedChecklists.forEach((checklistC) => {
    //   const projectId = checklistC.ID_Duan;
    //   const projectName = checklistC.ent_duan.Duan;
    //   const khoiName = checklistC.ent_khoicv.KhoiCV;
    //   const shiftName = checklistC.ent_calv.Tenca;

    //   if (!result[projectId]) {
    //     result[projectId] = {
    //       projectName,
    //       khois: {},
    //     };
    //   }

    //   if (!result[projectId].khois[khoiName]) {
    //     result[projectId].khois[khoiName] = {
    //       shifts: {},
    //     };
    //   }

    //   if (!result[projectId].khois[khoiName].shifts[shiftName]) {
    //     result[projectId].khois[khoiName].shifts[shiftName] = {
    //       totalTongC: 0,
    //       totalTong: checklistC.Tong,
    //       userCompletionRates: [],
    //     };
    //   }

    //   // Accumulate data for shifts
    //   result[projectId].khois[khoiName].shifts[shiftName].totalTongC +=
    //     checklistC.TongC;

    //   // Calculate user completion rate and add to the list
    //   const userCompletionRate = (checklistC.TongC / checklistC.Tong) * 100;
    //   result[projectId].khois[khoiName].shifts[
    //     shiftName
    //   ].userCompletionRates.push(userCompletionRate);
    // });

    // // Calculate completion rates for each khối and project
    // Object.values(result).forEach((project) => {
    //   Object.values(project.khois).forEach((khoi) => {
    //     let totalKhoiCompletionRatio = 0;
    //     let totalShifts = 0;

    //     Object.values(khoi.shifts).forEach((shift) => {
    //       // Calculate shift completion ratio
    //       let shiftCompletionRatio = shift.userCompletionRates.reduce(
    //         (sum, rate) => sum + rate,
    //         0
    //       );
    //       if (shiftCompletionRatio > 100) {
    //         shiftCompletionRatio = 100; // Cap each shift at 100%
    //       }

    //       // Sum up completion ratios for each khối
    //       totalKhoiCompletionRatio += shiftCompletionRatio;
    //       totalShifts += 1;
    //     });

    //     // Calculate average completion ratio for khối
    //     khoi.completionRatio = totalKhoiCompletionRatio / totalShifts;
    //   });
    // });

    // // Prepare response data
    // let projectNames = [];
    // let percentageData = [];

    // Object.values(result).forEach((project) => {
    //   projectNames.push(project.projectName);

    //   let totalCompletionRatio = 0;
    //   let totalKhois = 0;

    //   Object.values(project.khois).forEach((khoi) => {
    //     totalCompletionRatio += khoi.completionRatio;
    //     totalKhois += 1;
    //   });

    //   const avgCompletionRatio =
    //     totalKhois > 0 ? totalCompletionRatio / totalKhois : 0;
    //   percentageData.push(avgCompletionRatio.toFixed(2)); // Format to 2 decimal places
    // });

    // // Sort the percentageData based on 'tangGiam' query parameter
    // // Tạo mảng các cặp [projectName, percentageData]
    // const projectWithData = projectNames.map((name, index) => ({
    //   name: name,
    //   percentage: parseFloat(percentageData[index]), // Đảm bảo giá trị là số
    // }));

    // // Sắp xếp dựa trên percentageData
    // if (tangGiam === "asc") {
    //   projectWithData.sort((a, b) => a.percentage - b.percentage); // Sắp xếp tăng dần
    // } else if (tangGiam === "desc") {
    //   projectWithData.sort((a, b) => b.percentage - a.percentage); // Sắp xếp giảm dần
    // }

    // const topResultArray = projectWithData.slice(0, Number(top));

    // // Sau khi sắp xếp, tách lại thành 2 mảng riêng
    // projectNames = topResultArray.map((item) => item.name);
    // percentageData = topResultArray.map((item) => item.percentage);

    // const resultArray = {
    //   categories: projectNames,
    //   series: [
    //     {
    //       type: String(year),
    //       data: [
    //         {
    //           name: "Tỉ lệ",
    //           data: percentageData,
    //         },
    //       ],
    //     },
    //   ],
    // };

    res.status(200).json({
      message: "Tỉ lệ hoàn thành của các dự án theo khối",
      data: relatedChecklists,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};
