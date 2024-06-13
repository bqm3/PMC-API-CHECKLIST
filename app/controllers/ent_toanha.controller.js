const {
  Ent_toanha,
  Ent_duan,
  Ent_khuvuc,
  Ent_user,
} = require("../models/setup.model");
const { Op, Sequelize } = require("sequelize");

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
      let whereClause = {
        isDelete: 0,
      };

      if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
        whereClause.ID_Duan = userData.ID_Duan;
      }

      await Ent_toanha.findAll({
        attributes: ["ID_Toanha", "ID_Duan", "Toanha", "Sotang", "isDelete"],
        include: {
          model: Ent_duan,
          attributes: ["Duan"],
        },
        where: whereClause,
        order: [["ID_Duan", "ASC"]],
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

exports.getDetail = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      let whereClause = {
        isDelete: 0,
      };

      if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
        whereClause.ID_Duan = userData.ID_Duan;
      }

      await Ent_toanha.findByPk(req.params.id, {
        attributes: ["ID_Toanha", "ID_Duan", "Toanha", "Sotang", "isDelete"],
        include: {
          model: Ent_duan,
          attributes: ["Duan"],
        },
        where: whereClause,
        order: [["ID_Duan", "ASC"]],
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
    if (userData) {
      let whereClause = {
        isDelete: 0,
      };

      if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
        whereClause.ID_Duan = userData.ID_Duan;
      }

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
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getKhuvucByToanha = async (req, res) => {
  try {
    const userData = req.user.data;

    const ID_User = req.params.id;
    if (userData) {
      let whereClause = {
        isDelete: 0,
      };

      if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
        whereClause.ID_Duan = userData.ID_Duan;
      }

      const user = await Ent_user.findByPk(ID_User, {
        attributes: [
          "ID_User",
          "UserName",
          "ID_Khuvucs",
          "Permission",
          "ID_Duan",
          "Password",
          "ID_KhoiCV",
          "Emails",
          "isDelete",
        ],
      });

      await Ent_toanha.findAll({
        attributes: [
          "ID_Toanha",
          "Toanha",
          "Sotang",
          "ID_Duan",
          "Vido",
          "Kinhdo",
          "isDelete",
        ],
        where: { isDelete: 0 },
        include: [
          {
            model: Ent_khuvuc,
            as: "ent_khuvuc",
            attributes: [
              "ID_Khuvuc",
              "ID_KhoiCV",
              "ID_KhoiCVs",
              "Makhuvuc",
              "MaQrCode",
              "Tenkhuvuc",
              "isDelete",
            ],
            where: {
              isDelete: 0,
              // Kiểm tra user.ID_KhoiCV có nằm trong mảng ID_KhoiCVs
              [Sequelize.Op.or]: [
                Sequelize.where(
                  Sequelize.fn('JSON_CONTAINS', Sequelize.col('ID_KhoiCVs'), JSON.stringify(user.ID_KhoiCV)),
                  '=',
                  1
                ),
                Sequelize.where(
                  Sequelize.fn('FIND_IN_SET', user.ID_KhoiCV, Sequelize.col('ID_KhoiCVs')),
                  '>',
                  0
                ),
              ],
            },
            required: false
          },
        ],
        where: whereClause,
        order: [["ID_Toanha", "ASC"]],
      })
        .then((data) => {

          res.status(200).json({
            message: "Danh sách tòa nhà!",
            data: data,
            user: user
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
