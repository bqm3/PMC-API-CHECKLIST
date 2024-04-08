const { Ent_toanha, Ent_duan } = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  // Validate request
  if (!req.body.Toanha || !req.body.Sotang) {
    res.status(400).json({
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
      res.status(200).json({
        message: "Tạo tòa nhà thành công!",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
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
          [Op.and]: [
            {isDelete: 0},
            {ID_Duan: userData.ID_Duan}
          ]
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách tòa nhà!",
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
    if (req.params.id && userData) {
      Ent_toanha.update(
        {
          ID_Duan: req.body.ID_Duan,
          Toanha: req.body.Toanha,
          Sotang: req.body.Sotang,
        },
        {
          where: {
            ID_Toanha: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Cập nhật tòa nhà thành công!!!",
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

exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_toanha.update(
        { isDelete: 1 },
        {
          where: {
            ID_Toanha: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa tòa nhà thành công!",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
