const { Op } = require("sequelize");
const Ent_tailieuphanhe = require("../models/ent_tailieuphanhe.model");
const Ent_phanhe = require("../models/ent_phanhe.model");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      const { ID_Phanhe, Duongdan, Ghichu } = req.body;
      if (!ID_Phanhe || !Duongdan) {
        return res.status(400).json({
          message: "Thiếu trường thông tin",
        });
      }

      const newData = await Ent_tailieuphanhe.create({
        ID_Duan: userData.ID_Duan,
        ID_Phanhe,
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
