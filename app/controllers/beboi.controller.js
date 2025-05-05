const { fn, col, Op, literal, where } = require("sequelize");
const beboi = require("../models/beboi.model");
const {
  Ent_checklist,
  Tb_checklistc,
  Ent_loaisosanh,
} = require("../models/setup.model");
const moment = require("moment");

exports.getBeBoiByMonth = async (req, res) => {
  try {
    const Ngay_ghi_nhan = moment().format("YYYY-MM-DD");
    const Ngay_dau_thang = moment().startOf("month").format("YYYY-MM-DD");
    const userData = req.user.data;
    const resData = await beboi.findAll({
      attributes: [
        "ID_Duan",
        [fn("DATE", col("Ngay_ghi_nhan")), "Ngay_ghi_nhan"],
        [
          literal('GROUP_CONCAT(DISTINCT COALESCE(Nguoi_tao, "Chưa nhập"))'),
          "Nguoi_tao",
        ],
      ],
      where: {
        ID_Duan: userData?.ID_Duan,
        Ngay_ghi_nhan: {
          [Op.between]: [
            `${Ngay_dau_thang} 00:00:00`,
            `${Ngay_ghi_nhan} 23:59:59`,
          ],
        },
      },
      group: ["ID_Duan", fn("DATE", col("Ngay_ghi_nhan"))],
      order: [[fn("DATE", col("Ngay_ghi_nhan")), "DESC"]],
      raw: true,
    });

    return res.status(200).json({
      message: "Danh sách bể bơi (gộp theo ngày và dự án)",
      data: resData || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

exports.detailChecklistBeboi = async (req, res) => {
  try {
    const userData = req.user.data;
    const Ngay_ghi_nhan = req.params.date;
    const resData = await beboi.findAll({
      where: {
        ID_Duan: userData?.ID_Duan,
        [Op.and]: [where(fn("DATE", col("Ngay_ghi_nhan")), Ngay_ghi_nhan)],
      },

      attributes: [
        "ID_Beboi",
        "ID_Duan",
        "Ngay_ghi_nhan",
        "Nguoi_tao",
        "ID_Checklist",
        "ID_ChecklistC",
        "Giatridinhdanh",
        "Giatrighinhan",
        "Giatrisosanh",
        "ID_Loaisosanh",
      ],
      include: [
        {
          model: Ent_checklist,
          as: "ent_checklist",
          attributes: [
            "ID_Checklist",
            "Checklist",
            "Giatrinhan",
            "Giatriloi",
            "Giatrisosanh",
            "Giatridinhdanh",
            "Tieuchuan",
          ],
        },
        {
          model: Tb_checklistc,
          as: "tb_checklistc",
          attributes: [
            "ID_ChecklistC",
            "ID_KhoiCV",
            "ID_User",
            "ID_ThietLapCa",
            "ID_Calv",
          ],
        },
      ],
      order: [["Ngay_ghi_nhan", "DESC"]],
    });

    return res.status(200).json({
      message: "Danh sách bể bơi",
      data: resData || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};
