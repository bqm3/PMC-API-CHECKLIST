const { Ent_tang } = require("../models/setup.model");

// Create and Save a new Ent_tang
exports.create = (req, res, next) => {
  // Validate request
  try {
    if (!req.body.Tentang || !req.body.Sotang) {
      res.status(400).json({
        message: "Cần nhập đầy đủ thông tin!",
      });
      return;
    }

    const userData = req.user.data;
    const data = {
      Sotang: req.body.Sotang,
      Tentang: req.body.Tentang,
      ID_User: userData.ID_User,
      isDelete: 0,
    };

    Ent_tang.create(data)
      .then((data) => {
        res.status(201).json({
          message: "Tạo tầng thành công!",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      await Ent_tang.findAll({
        attributes: ["ID_Tang", "Tentang", "Sotang", "isDelete"],
      
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Danh sách tầng!",
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