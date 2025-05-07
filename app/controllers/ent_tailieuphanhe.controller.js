const { Op } = require("sequelize");
const Ent_tailieuphanhe = require("../models/ent_tailieuphanhe.model");
const Ent_phanhe = require("../models/ent_phanhe.model");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      const { ID_Phanhe, Tenduongdan, Duongdan, Ghichu } = req.body;
      if (!ID_Phanhe || !Duongdan) {
        return res.status(400).json({
          message: "Thiếu trường thông tin",
        });
      }

      const newData = await Ent_tailieuphanhe.create({
        ID_Duan: userData.ID_Duan,
        ID_Phanhe,
        Tenduongdan,
        Duongdan,
        Ghichu,
      });

      return res.status(200).json({
        message: "Tạo tài liệu thành công",
        data: newData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.findByID = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Duongdantl = req.params.id;
    if (userData) {
      const newData = await Ent_tailieuphanhe.findOne({
        where: {
          ID_Duongdantl,
        },
      });

      return res.status(200).json({
        message: "Tải tài liệu thành công",
        data: newData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Duongdantl = req.params.id;
    if (userData) {
      const { ID_Phanhe, Tenduongdan, Duongdan, Ghichu } = req.body;
      if (!ID_Phanhe || !Duongdan) {
        return res.status(400).json({
          message: "Thiếu trường thông tin",
        });
      }

      const newData = await Ent_tailieuphanhe.update(
        {
          ID_Duan: userData.ID_Duan,
          ID_Phanhe,
          Tenduongdan,
          Duongdan,
          Ghichu,
        },
        {
          where: {
            ID_Duongdantl,
          },
        }
      );

      return res.status(200).json({
        message: "Tải tài liệu thành công",
        data: newData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.deleteMul = async (req, res) => {
  try {
    const userData = req.user.data;
    const deleteRows = req.body;
    const idsToDelete = deleteRows.map((row) => row.ID_Duongdantl);
    if (userData) {
      Ent_tailieuphanhe.update(
        { isDelete: 1 },
        {
          where: {
            ID_Duongdantl: idsToDelete,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa tài liệu thành công!",
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
exports.getByDuan = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      const data = await Ent_tailieuphanhe.findAll({
        where: {
          isDelete: 0,
          ID_Duan: userData.ID_Duan,
        },
        include: [
          {
            model: Ent_phanhe,
            as: "ent_phanhe",
          },
        ],
      });

      return res.status(200).json({
        message: "Tải tài liệu thành công",
        data: data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
