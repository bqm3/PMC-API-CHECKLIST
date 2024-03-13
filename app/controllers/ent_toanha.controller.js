const { Ent_toanha, Ent_duan } = require("../models/setup.model");

exports.create = (req, res) => {
  // Validate request
  if (!req.body.Toanha || !req.body.Sotang) {
    res.status(400).send({
      message: "Phải nhập đầy đủ dữ liệu!",
    });
    return;
  }

  // Create a Ent_toanha
  const data = {
    ID_Duan: req.body.ID_Duan,
    Toanha: req.body.Toanha,
    Sotang: req.body.Sotang,
    isDelete: 0,
  };

  // Save Ent_toanha in the database
  Ent_toanha.create(data)
    .then((data) => {
      res.status(201).json({
        message: "Tạo tòa nhà thành công!",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Lỗi! Vui lòng thử lại sau.",
      });
    });
};

exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      await Ent_toanha.findAll({
        attributes: ["ID_Toanha", "ID_Duan", "Toanha", "Sotang", "isDelete"],
        include: {
          model: Ent_duan,
          attributes: ["Duan"],
        },
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Danh sách tòa nhà!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else {
      return res.status(401).json({
        message: "Bạn không có quyền truy cập",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
