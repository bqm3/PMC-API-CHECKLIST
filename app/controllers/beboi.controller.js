const { fn, col, Op, literal, where } = require("sequelize");
const beboi = require("../models/beboi.model");
const { Ent_checklist, Tb_checklistc, Ent_loaisosanh, Ent_duan, Ent_chinhanh, Ent_nhom, Ent_phanloaida } = require("../models/setup.model");
const moment = require("moment");
const sequelize = require("../config/db.config");
const { QueryTypes } = require("sequelize");

exports.getBeBoiByMonth = async (req, res) => {
  try {
    const Ngay_ghi_nhan = moment().format("YYYY-MM-DD");
    const Ngay_dau_thang = moment().startOf("month").format("YYYY-MM-DD");
    const userData = req.user.data;
    const resData = await beboi.findAll({
      attributes: [
        "ID_Duan",
        [fn("DATE", col("Ngay_ghi_nhan")), "Ngay_ghi_nhan"],
        [literal('GROUP_CONCAT(DISTINCT COALESCE(Nguoi_tao, "Chưa nhập"))'), "Nguoi_tao"],
      ],
      where: {
        ID_Duan: userData?.ID_Duan,
        Ngay_ghi_nhan: {
          [Op.between]: [`${Ngay_dau_thang} 00:00:00`, `${Ngay_ghi_nhan} 23:59:59`],
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
    const rawData = await beboi.findAll({
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
        "createdAt",
      ],
      include: [
        {
          model: Ent_checklist,
          as: "ent_checklist",
          attributes: ["ID_Checklist", "Checklist", "Giatrinhan", "Giatriloi", "Giatrisosanh", "Giatridinhdanh", "Tieuchuan"],
        },
        {
          model: Tb_checklistc,
          as: "tb_checklistc",
          attributes: ["ID_ChecklistC", "ID_KhoiCV", "ID_User", "ID_ThietLapCa", "ID_Calv"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Giữ lại bản ghi mới nhất theo ID_Checklist
    const latestPerChecklist = new Map();

    for (const item of rawData) {
      const id = item.ID_Checklist;
      if (!latestPerChecklist.has(id)) {
        latestPerChecklist.set(id, item);
      }
    }

    // Xử lý từng bản
    const processedData = [...latestPerChecklist.values()].map((item) => {
      const dinhdanh = parseFloat(item.Giatridinhdanh || 0);
      const ghinhan = parseFloat(item.Giatrighinhan || 0);
      const sosanh = parseFloat(item.Giatrisosanh || 0);
      let tyle = null;
      let vuotChuan = null;

      if (!isNaN(dinhdanh) && !isNaN(ghinhan) && ghinhan !== 0) {
        tyle = ((ghinhan - dinhdanh) / dinhdanh) * 100;
        if (!isNaN(sosanh)) {
          vuotChuan = Math.abs(tyle) > sosanh;
        }
      }

      return {
        ...item.toJSON(),
        Tyle: tyle !== null ? +tyle.toFixed(2) : null,
        VuotChuan: vuotChuan,
      };
    });

    return res.status(200).json({
      message: "Danh sách bể bơi",
      data: processedData || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

exports.duanListBeBoi = async (req, res) => {
  try {
    const data = await Ent_duan.findAll({
      attributes: [
        "ID_Duan",
        "Duan",
        "Diachi",
        "Vido",
        "Kinhdo",
        "ID_Nhom",
        "ID_Chinhanh",
        "ID_Linhvuc",
        "ID_Loaihinh",
        "Percent",
        "ID_Phanloai",
        "P0",
        "HSSE",
        "BeBoi",
        "Logo",
        "isDelete",
      ],
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
      where: {
        isDelete: 0,
        BeBoi: 1,
        ID_Duan: {
          [Op.notIn]: [1, 140],
        },
      },
    });

    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Lỗi khi lấy danh sách dự án.",
    });
  }
};

exports.analytics = async (req, res) => {
  try {
    const { type, p_ngay, p_ID_Duan } = req.body;
    const int_type = parseInt(type, 10);
    let respone = "";
    switch (int_type) {
      case 1:
        respone = await BEBOI_DuAn_DaLamChecklist(p_ngay);
        break;
      case 2:
        respone = await BEBOI_Phan1(p_ngay);
        break;
      case 3:
        respone = await BeBoi_Danhsachdachualam(p_ngay);
        break;
      case 4:
        respone = await St_ThongTinBeBoi(p_ID_Duan, p_ngay);
        break;
      case 5:
        respone = await Beboi_duan_csbt(p_ngay);
        break;
      case 6:
        respone = await BEBOI_Canhbao(p_ngay);
        break;
    }

    res.status(200).json(respone);
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật P0.",
    });
  }
};

const BEBOI_DuAn_DaLamChecklist = async (p_Ngay) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL BEBOI_DuAn_DaLamChecklist(:p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const BEBOI_Phan1 = async (p_Ngay) => {
  try {
    const dayBeforeYesterday = moment().tz("Asia/Ho_Chi_Minh").subtract(2, "days").format("YYYY-MM-DD");
    // Gọi stored procedure trong MySQL

    const resultYesterday = await sequelize.query(
      "CALL BEBOI_Phan1(:p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    const resultDayBefore = await sequelize.query(
      "CALL BEBOI_Phan1(:p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_Ngay: dayBeforeYesterday },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return {
      yesterday: resultYesterday[0],
      dayBeforeYesterday: resultDayBefore[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const BeBoi_Danhsachdachualam = async (p_Ngay) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL BeBoi_Danhsachdachualam(:p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const St_ThongTinBeBoi = async (p_ID_Duan, p_Ngay) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL St_ThongTinBeBoi(:p_ID_Duan, :p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_ID_Duan, p_Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};


const Beboi_duan_csbt = async (p_ngay) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Beboi_duan_csbt(:p_ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const BEBOI_Canhbao = async (ngay_input) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL BEBOI_Canhbao(:ngay_input)", // dùng CALL thay vì EXEC
      {
        replacements: { ngay_input },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );
    const sorted = result.sort((a, b) => a.Duan.localeCompare(b.Duan));
    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return sorted;
  } catch (error) {
    throw new Error(error.message);
  }
};
