const { Ent_Thamsophanhe, Ent_duan } = require("../../models/setup.model");
const sequelize = require("../../config/db.config");
const xlsx = require("xlsx");

exports.uploads = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng tải lên file Excel." });
    }

    // Đọc file Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data.length) {
      return res.status(400).json({ success: false, message: "File Excel không có dữ liệu." });
    }

    const arrDuan = await Ent_duan.findAll({
      attributes: ["ID_Duan", "Duan"],
      where: {
        isDelete: 0,
      },
    });

    const records = [];
    for (let i = 0; i < data.length; i++) {
      const matchingDuan = arrDuan.find((item) => item.ID_Duan === data[i]["ID_Duan"]);

      const record = {
        ID_Duan: data[i]["ID_Duan"],
        Tenduan: matchingDuan ? matchingDuan.Duan : data[i]["Dự án"],
        ID_Phanhe: "1",
        Thamso: "Xa_thai",
        iGiayphep: data[i]["iGiayphep"] ? 0 : 1,
        Chisogiayphep: data[i]["Mức xả thải theo giấy phép"],
        Chisotrungbinh: data[i]["Mức xả thải trung bình của dự án"],
      };
      if (data[i]["Mức xả thải theo giấy phép"] != "DỰ ÁN KHÔNG QUẢN LÝ SỐ LIỆU NÀY") {
        records.push(record);
      }
    }

    await Ent_Thamsophanhe.bulkCreate(records, { transaction });

    await transaction.commit();
    return res.status(200).json({ success: true, message: "Tải lên và xử lý thành công." });
  } catch (error) {
    await transaction.rollback();
    console.log("Lỗi khi tải lên Excel:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý file. Vui lòng thử lại.",
      error: error.message,
    });
  }
};

exports.getThamsophanhe = async (dataReq) => {
  try {
    const data = await Ent_Thamsophanhe.findOne({
      where: {
        ID_Phanhe: dataReq?.ID_Phanhe,
        Thamso: dataReq?.Thamso,
        ID_Duan: dataReq?.ID_Duan,
        isDelete: 0,
      },
    });

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getDetail = async (req, res) => {
  try {
    const user = req.user.data;
    const { ID_Phanhe, Thamso } = req.query;

    const data = await Ent_Thamsophanhe.findOne({
      where: {
        ID_Phanhe,
        Thamso,
        ID_Duan: user?.ID_Duan,
        isDelete: 0,
      },
    });

    return res.status(201).json({
      message: "Thông tin tham số phân hệ",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý file. Vui lòng thử lại.",
      error: error.message,
    });
  }
};
