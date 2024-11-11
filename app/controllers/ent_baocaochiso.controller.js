const { uploadFile } = require("../middleware/auth_google");
const {
  Ent_baocaochiso,
  Ent_user,
  Ent_duan,
} = require("../models/setup.model");
const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/db.config");
const { getPreviousMonth } = require("../utils/util");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    const { body, files } = req;
    const { ID_Duan, ID_User, Day, Month, Year, Electrical, Water, Ghichu } =
      body;

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

    const uploadedFileIds = [];
    const isEmpty = (obj) => Object.keys(obj).length === 0;

    if (!isEmpty(files)) {
      for (const image of files) {
        const fileId = await uploadFile(image);
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

    Ent_baocaochiso.create(data)
      .then(() => {
        res.status(200).json({
          message: "Gửi thành công!",
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
            [Op.ne]: req.params.id,
          },
          ID_Duan: ID_Duan,
          Month: Month,
          Year: Year,
          isDelete: 0,
        },
      });

      if (findBaoCao) {
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

      const uploadedFileIds = [];
      const isEmpty = (obj) => Object.keys(obj).length === 0;

      if (!isEmpty(files)) {
        for (const image of files) {
          const fileId = await uploadFile(image);
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
        ImageElectrical: imageElectricalId || ImageElectrical,
        ImageWater: imageWaterId || ImageWater,
        ElectricalBefore: findCheck?.Electrical || ElectricalBefore,
        WaterBefore: findCheck?.Water || WaterBefore,
        Ghichu: Ghichu || null,
      };

      Ent_baocaochiso.update(data, {
        where: {
          ID_Baocaochiso: req.params.id,
        },
      })
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


exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;

    Ent_baocaochiso.update({
      isDelete: 1, // 1: xóa, 0: chưa xóa
    }, {
      where: {
        ID_Baocaochiso: req.params.id,
      },
    })
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
} 