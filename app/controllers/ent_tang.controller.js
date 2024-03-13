const {Ent_tang} = require("../models/setup.model");

// Create and Save a new Ent_tang
exports.create = (req, res, next) => {
  // Validate request
  try {
    if (!req.body.Tentang || !req.body.Sotang) {
      res.status(400).send({
        message: "Cần nhập đầy đủ thông tin!",
      });
      return;
    }

    const userData = req.user.data;
    if (userData.Permission === 1) {
      const data = {
        Sotang: req.body.Sotang,
        Tentang: req.body.Tentang,
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      Ent_tang
        .create(data)
        .then((data) => {
          res.status(201).json({
            message: "Tạo tầng thành công!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }else {
        return res.status(400).json({
            message: "Bạn không có quyền tạo tầng.",
          });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
