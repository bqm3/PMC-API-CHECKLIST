const { Op } = require("sequelize");
const Ent_tailieuphanhe = require("../models/ent_tailieuphanhe.model");

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
