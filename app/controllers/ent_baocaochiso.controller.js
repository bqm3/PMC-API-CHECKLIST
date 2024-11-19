const {
  uploadFile,
  deleteFileFromGoogleDrive,
} = require("../middleware/auth_google_child");
const {
  Ent_baocaochiso,
  Ent_user,
  Ent_duan,
} = require("../models/setup.model");
const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/db.config");
const { getPreviousMonth } = require("../utils/util");

exports.create = async (req, res) => {
  const uploadedFileIds = [];
  const transaction = await sequelize.transaction(); // Bắt đầu transaction
  try {
    const userData = req.user.data;
    const { body, files } = req;
    const {
      ID_Duan,
      ID_User,
      Day,
      Month,
      Year,
      Electrical_CDT,
      Water_CDT,
      Electrical_CuDan,
      Water_CuDan,
      Electrical_CDT_Real,
      Electrical_CuDan_Real,
      Water_CDT_Real,
      Water_CuDan_Real,
      Ghichu,
    } = body;

    if (Electrical_CDT && Water_CDT) {
      if (!isValidNumber(Water_CDT) || !isValidNumber(Electrical_CDT)) {
        return res.status(400).json({
          message:
            "Chỉ số điện và Nước phải là số hợp lệ (có thể chứa dấu . hoặc ,).",
        });
      }
    }

    const findBaoCao = await Ent_baocaochiso.findOne({
      attributes: [
        "ID_Baocaochiso",
        "ID_Duan",
        "ID_User",
        "Month",
        "Year",
        "isDelete",
      ],
      where: {
        ID_Duan: ID_Duan,
        Month: Month,
        Year: Year,
        isDelete: 0,
      },
    });

    if (findBaoCao) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Báo cáo đã tồn tại cho tháng này",
      });
    }

    const dateCheck = getPreviousMonth(Month, Year);
    const findCheck = await Ent_baocaochiso.findOne({
      attributes: [
        "ID_Baocaochiso",
        "ID_Duan",
        "ID_User",
        "Month",
        "Year",
        "isDelete",
        "Electrical_CDT",
        "Water_CDT",
        "Electrical_CuDan",
        "Water_CuDan",
        "Electrical_CDT_Real",
        "Water_CDT_Real",
        "Electrical_CuDan_Real",
        "Water_CuDan_Real",
      ],
      where: {
        ID_Duan: ID_Duan,
        Month: dateCheck.month,
        Year: dateCheck.year,
        isDelete: 0,
      },
    });

    const isEmpty = (obj) => Object.keys(obj).length === 0;

    if (!isEmpty(files)) {
      for (const image of files) {
        const imageType =
        image.fieldname === "ImageElectrical_CDT"
        ? "ImageElectrical_CDT"
        : image.fieldname === "ImageElectrical_CuDan"
        ? "ImageElectrical_CuDan"
        : image.fieldname === "ImageWater_CDT"
        ? "ImageWater_CDT"
        : image.fieldname === "ImageWater_CuDan"
        ? "ImageWater_CuDan"
        : null;
        const fileId = await uploadFile(
          image,
          userData.ent_duan?.Duan,
          imageType,
          Month,
          Year
        );
        uploadedFileIds.push({ fileId, fieldname: image.fieldname });
      }
    }
    
    // Tạo các biến để lưu trữ id tương ứng
    let imageElectricalId_CDT = ImageElectrical_CDT; // Nếu có ảnh cũ, giữ lại
    let imageWaterId_CDT = ImageWater_CDT; // Nếu có ảnh cũ, giữ lại
    let imageElectricalId_CuDan = ImageElectrical_CuDan; // Nếu có ảnh cũ, giữ lại
    let imageWaterId_CuDan = ImageWater_CuDan; // Nếu có ảnh cũ, giữ lại

    // Duyệt qua từng phần tử trong mảng để lưu id
    uploadedFileIds.forEach((item) => {
      if (item.fieldname === "ImageElectrical_CDT") {
        imageElectricalId_CDT = item.fileId.id; // Cập nhật ảnh điện
      } else if (item.fieldname === "ImageWater_CDT") {
        imageWaterId_CDT = item.fileId.id; // Cập nhật ảnh nước
      } else if (item.fieldname === "ImageElectrical_CuDan") {
        imageElectricalId_CuDan = item.fileId.id; // Cập nhật ảnh điện
      } else if (item.fieldname === "ImageWater_CuDan") {
        imageWaterId_CuDan = item.fileId.id; // Cập nhật ảnh nước
      }
    });

    const data = {
      ID_Duan: ID_Duan || null,
      Day: Day || null,
      ID_User: ID_User || null,
      Month: Month || null,
      Year: Year || null,

      Electrical_CDT: Electrical_CDT || null,
      Water_CDT: Water_CDT || null,
      ImageElectrical_CDT: imageElectricalId_CDT,
      ImageWater_CDT: imageWaterId_CDT,
      ElectricalBefore_CDT: findCheck?.Electrical_CDT || ElectricalBefore_CDT,
      WaterBefore_CDT: findCheck?.Water_CDT || WaterBefore_CDT,

      Electrical_CuDan: Electrical_CuDan || null,
      Water_CuDan: Water_CuDan || null,
      ImageElectrical_CuDan: imageElectricalId_CuDan,
      ImageWater_CuDan: imageWaterId_CuDan,
      ElectricalBefore_CuDan:
        findCheck?.Electrical_CuDan || ElectricalBefore_CuDan,
      WaterBefore_CuDan: findCheck?.Water_CuDan || WaterBefore_CuDan,
      Electrical_CDT_Real,
      Water_CDT_Real,
      Electrical_CuDan_Real,
      Water_CuDan_Real,
      Ghichu: Ghichu || null,
    };

    await Ent_baocaochiso.create(data, { transaction });

    // Commit transaction sau khi tất cả thành công
    await transaction.commit();

    res.status(200).json({ message: "Gửi thành công!" });
  } catch (error) {
    // Nếu có lỗi, rollback transaction và xóa ảnh đã tải lên
    await transaction.rollback();

    res
      .status(500)
      .json({ message: error.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

exports.getbyDuan = async (req, res) => {
  try {
    const userData = req.user.data;
    let whereCondition = {
      isDelete: 0,
      ID_Duan: userData?.ID_Duan,
    };
    if (userData) {
      await Ent_baocaochiso.findAll({
        attributes: [
          "ID_Baocaochiso",
          "ID_User",
          "ID_Duan",
          "Day",
          "Month",
          "Year",
          "Electrical_CDT",
          "Water_CDT",
          "ImageWater_CDT",
          "ImageElectrical_CDT",
          "ElectricalBefore_CDT",
          "WaterBefore_CDT",
          "Electrical_CuDan",
          "Water_CuDan",
          "ImageWater_CuDan",
          "ImageElectrical_CuDan",
          "ElectricalBefore_CuDan",
          "WaterBefore_CuDan",
          "Electrical_CDT_Real",
          "Water_CDT_Real",
          "Electrical_CuDan_Real",
          "Water_CuDan_Real",
          "Ghichu",
          "isDelete",
        ],
        include: [
          {
            model: Ent_user,
            as: "ent_user",
            attributes: ["UserName", "Email", "Hoten"],
          },
          {
            model: Ent_duan,
            as: "ent_duan",
            attributes: ["Duan"],
          },
        ],
        where: whereCondition,
        order: [["Day", "DESC"]],
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.update = async (req, res) => {
  const transaction = await sequelize.transaction(); // Bắt đầu transaction
  const uploadedFileIds = [];
  try {
    const userData = req.user.data;
    const { body, files } = req;
    const {
      ID_Duan,
      ID_User,
      Day,
      Month,
      Year,
      Ghichu,
      Electrical_CDT,
      Water_CDT,
      ImageElectrical_CDT,
      ImageWater_CDT,
      ElectricalBefore_CDT,
      WaterBefore_CDT,
      Electrical_CuDan,
      Water_CuDan,
      ImageElectrical_CuDan,
      ImageWater_CuDan,
      ElectricalBefore_CuDan,
      WaterBefore_CuDan,
      Electrical_CDT_Real,
      Water_CDT_Real,
      Electrical_CuDan_Real,
      Water_CuDan_Real,
    } = body;

    if (Electrical_CDT && Water_CDT) {
      if (!isValidNumber(Water_CDT) || !isValidNumber(Electrical_CDT)) {
        return res.status(400).json({
          message:
            "Chỉ số điện và Nước phải là số hợp lệ (có thể chứa dấu . hoặc ,).",
        });
      }
    }

    // Kiểm tra báo cáo đã tồn tại cho tháng này
    const findBaoCao = await Ent_baocaochiso.findOne({
      attributes: [
        "ID_Baocaochiso",
        "ID_Duan",
        "ID_User",
        "Month",
        "Year",
        "isDelete",
      ],
      where: {
        ID_Baocaochiso: {
          [Op.ne]: req.params.id, // Không lấy báo cáo này (update)
        },
        ID_Duan: ID_Duan,
        Month: Month,
        Year: Year,
        isDelete: 0,
      },
      transaction,
    });

    if (findBaoCao) {
      return res
        .status(400)
        .json({ message: "Báo cáo đã tồn tại cho tháng này" });
    }

    // Kiểm tra báo cáo của tháng trước
    const dateCheck = getPreviousMonth(Month, Year);
    const findCheck = await Ent_baocaochiso.findOne({
      attributes: [
        "ID_Baocaochiso",
        "ID_Duan",
        "ID_User",
        "Month",
        "Year",
        "isDelete",
        "Electrical_CDT",
        "Water_CDT",
        "Electrical_CuDan",
        "Water_CuDan",
      ],
      where: {
        ID_Duan: ID_Duan,
        Month: dateCheck.month,
        Year: dateCheck.year,
        isDelete: 0,
      },
      transaction,
    });

    // Kiểm tra file upload mới
    const isEmpty = (obj) => Object.keys(obj).length === 0;

    // Nếu có ảnh được upload, tải lên Google Drive
    if (!isEmpty(files)) {
      for (const image of files) {
        const imageType =
          image.fieldname === "ImageElectrical_CDT"
            ? "ImageElectrical_CDT"
            : image.fieldname === "ImageElectrical_CuDan"
            ? "ImageElectrical_CuDan"
            : image.fieldname === "ImageWater_CDT"
            ? "ImageWater_CDT"
            : image.fieldname === "ImageWater_CuDan"
            ? "ImageWater_CuDan"
            : null;
        const fileId = await uploadFile(
          image,
          userData.ent_duan?.Duan,
          imageType,
          Month,
          Year
        );
        uploadedFileIds.push({ fileId, fieldname: image.fieldname });
      }
    }

    // Gán ID ảnh đã upload vào các trường tương ứng
    let imageElectricalId_CDT = ImageElectrical_CDT; // Nếu có ảnh cũ, giữ lại
    let imageWaterId_CDT = ImageWater_CDT; // Nếu có ảnh cũ, giữ lại
    let imageElectricalId_CuDan = ImageElectrical_CuDan; // Nếu có ảnh cũ, giữ lại
    let imageWaterId_CuDan = ImageWater_CuDan; // Nếu có ảnh cũ, giữ lại

    uploadedFileIds.forEach((item) => {
      if (item.fieldname === "ImageElectrical_CDT") {
        imageElectricalId_CDT = item.fileId.id; // Cập nhật ảnh điện
      } else if (item.fieldname === "ImageWater_CDT") {
        imageWaterId_CDT = item.fileId.id; // Cập nhật ảnh nước
      } else if (item.fieldname === "ImageElectrical_CuDan") {
        imageElectricalId_CuDan = item.fileId.id; // Cập nhật ảnh điện
      } else if (item.fieldname === "ImageWater_CuDan") {
        imageWaterId_CuDan = item.fileId.id; // Cập nhật ảnh nước
      }
    });

    // Cập nhật dữ liệu cho báo cáo
    const data = {
      ID_Duan: ID_Duan || null,
      Day: Day || null,
      ID_User: ID_User || null,
      Month: Month || null,
      Year: Year || null,

      Electrical_CDT: Electrical_CDT || null,
      Water_CDT: Water_CDT || null,
      ImageElectrical_CDT: imageElectricalId_CDT,
      ImageWater_CDT: imageWaterId_CDT,
      ElectricalBefore_CDT: findCheck?.Electrical_CDT || ElectricalBefore_CDT,
      WaterBefore_CDT: findCheck?.Water_CDT || WaterBefore_CDT,

      Electrical_CuDan: Electrical_CuDan || null,
      Water_CuDan: Water_CuDan || null,
      ImageElectrical_CuDan: imageElectricalId_CuDan,
      ImageWater_CuDan: imageWaterId_CuDan,
      ElectricalBefore_CuDan:
        findCheck?.Electrical_CuDan || ElectricalBefore_CuDan,
      WaterBefore_CuDan: findCheck?.Water_CuDan || WaterBefore_CuDan,
      
      Electrical_CDT_Real,
      Water_CDT_Real,
      Electrical_CuDan_Real,
      Water_CuDan_Real,
      Ghichu: Ghichu || null,
    };

    // Cập nhật báo cáo trong transaction
    await Ent_baocaochiso.update(data, {
      where: { ID_Baocaochiso: req.params.id },
      transaction,
    });

    // Commit transaction sau khi tất cả thành công
    await transaction.commit();

    res.status(200).json({ message: "Thay đổi thành công!" });
  } catch (error) {
    // Nếu có lỗi, rollback transaction và xóa ảnh đã tải lên
    await transaction.rollback();
    res
      .status(500)
      .json({ message: error.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;

    Ent_baocaochiso.update(
      {
        isDelete: 1, // 1: xóa, 0: chưa xóa
      },
      {
        where: {
          ID_Baocaochiso: req.params.id,
        },
      }
    )
      .then(() => {
        res.status(200).json({
          message: "Thay đổi thành công!",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const isValidNumber = (value) => {
  const regex = /^(\d+([.,]\d{1,2})?)$/; // Số nguyên hoặc số thập phân có dấu '.' hoặc ','
  return regex.test(value);
};
