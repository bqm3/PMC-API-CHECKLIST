const { Ent_Phanhe } = require("../models/setup.model");

exports.getAll = async (req, res) => {
  try {
    const data = await Ent_Phanhe.findAll({
      where: {
        isDelete: 0,
      },
    });

    return res.status(201).json({
      message: "Danh sách phân hệ",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { Phanhe } = req.body;

    if (!Phanhe) {
      return res.status(400).json({ success: false, message: "Thiếu tên phân hệ." });
    }

    const isExist = await Ent_Phanhe.findOne({
      where: { Phanhe, isDelete: 0 },
    });

    if (isExist) {
      return res.status(409).json({ success: false, message: "Phân hệ đã tồn tại." });
    }

    const newItem = await Ent_Phanhe.create({ Phanhe });

    res.status(201).json({
      success: true,
      message: "Tạo phân hệ thành công.",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { Phanhe } = req.body;

    const item = await Ent_Phanhe.findByPk(id);

    if (!item || item.isDelete === 1) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phân hệ." });
    }

    if (Phanhe && Phanhe !== item.Phanhe) {
      const isExist = await Ent_Phanhe.findOne({
        where: {
          Phanhe,
          isDelete: 0,
          ID_Phanhe: { [require("sequelize").Op.ne]: id },
        },
      });

      if (isExist) {
        return res.status(409).json({ success: false, message: "Phân hệ đã tồn tại." });
      }

      item.Phanhe = Phanhe;
    }

    await item.save();

    res.json({
      success: true,
      message: "Cập nhật phân hệ thành công.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.softDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Ent_Phanhe.findByPk(id);

    if (!item || item.isDelete === 1) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phân hệ." });
    }

    item.isDelete = 1;
    await item.save();

    res.json({
      success: true,
      message: "Xóa phân hệ thành công.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


