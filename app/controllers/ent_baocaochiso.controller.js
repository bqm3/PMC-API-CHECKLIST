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
    const { ID_Duan, ID_User, Day, Month, Year, Electrical, Water, Ghichu } =
      body;

    if (Electrical && Water) {
      if (!isValidNumber(Water) || !isValidNumber(Electrical)) {
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
        "Electrical",
        "Water",
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
          image.fieldname === "ImageElectrical"
            ? "ImageElectrical"
            : "ImageWater";
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
    let imageElectricalId = null;
    let imageWaterId = null;

    // Duyệt qua từng phần tử trong mảng để lưu id
    uploadedFileIds.forEach((item) => {
      if (item.fieldname === "ImageElectrical") {
        imageElectricalId = item.fileId.id;
      } else if (item.fieldname === "ImageWater") {
        imageWaterId = item.fileId.id;
      }
    });

    const data = {
      ID_Duan: ID_Duan || null,
      Day: Day || null,
      ID_User: ID_User || null,
      Month: Month || null,
      Year: Year || null,
      Electrical: Electrical || null,
      Water: Water || null,
      ImageElectrical: imageElectricalId || null,
      ImageWater: imageWaterId || null,
      ElectricalBefore: findCheck?.Electrical || null,
      WaterBefore: findCheck?.Water || null,
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
          "Electrical",
          "Water",
          "ImageWater",
          "ImageElectrical",
          "ElectricalBefore",
          "WaterBefore",
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
      Electrical,
      Water,
      Ghichu,
      ImageElectrical,
      ImageWater,
      ElectricalBefore,
      WaterBefore,
    } = body;

    if (Electrical && Water) {
      if (!isValidNumber(Water) || !isValidNumber(Electrical)) {
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
        "Electrical",
        "Water",
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
          image.fieldname === "ImageElectrical"
            ? "ImageElectrical"
            : "ImageWater";
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
    let imageElectricalId = ImageElectrical; // Nếu có ảnh cũ, giữ lại
    let imageWaterId = ImageWater; // Nếu có ảnh cũ, giữ lại

    uploadedFileIds.forEach((item) => {
      if (item.fieldname === "ImageElectrical") {
        imageElectricalId = item.fileId.id; // Cập nhật ảnh điện
      } else if (item.fieldname === "ImageWater") {
        imageWaterId = item.fileId.id; // Cập nhật ảnh nước
      }
    });

    // Cập nhật dữ liệu cho báo cáo
    const data = {
      ID_Duan: ID_Duan || null,
      Day: Day || null,
      ID_User: ID_User || null,
      Month: Month || null,
      Year: Year || null,
      Electrical: Electrical || null,
      Water: Water || null,
      ImageElectrical: imageElectricalId,
      ImageWater: imageWaterId,
      ElectricalBefore: findCheck?.Electrical || ElectricalBefore,
      WaterBefore: findCheck?.Water || WaterBefore,
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
