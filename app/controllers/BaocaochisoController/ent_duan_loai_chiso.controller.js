const { Ent_duan } = require("../../models/setup.model");

exports.createDuanLoaiCS = async (req, res) => {
  try {
    const { ID_Duan, ID_LoaiCS } = req.body; // ID_LoaiCS là chuỗi dạng "1,2,3"

    const duan = await Ent_duan.findByPk(ID_Duan);

    if (!duan) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    // Nếu đã có ID_LoaiCS, thêm mới vào chuỗi
    const currentLoaiCS = duan.ID_LoaiCS || "";
    const updatedLoaiCS = [
      ...new Set([...currentLoaiCS.split(","), ...ID_LoaiCS.split(",")]),
    ]
      .filter((id) => id.trim())
      .join(",");

    await Ent_duan.update(
      { ID_LoaiCS: updatedLoaiCS },
      {
        where: { ID_Duan },
      }
    );

    res
      .status(201)
      .json({ message: "Thêm loại chỉ số thành công", updatedLoaiCS });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm loại chỉ số", error });
  }
};

exports.updateDuanLoaiCS = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Duan = userData.ID_Duan;
    const { ID_LoaiCS } = req.body; 

    const updated = await Ent_duan.update(
      { ID_LoaiCS },
      {
        where: {
          ID_Duan,
          isDelete: 0,
        },
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    res.status(200).json({
      message: "Cập nhật loại chỉ số thành công",
      updatedID_LoaiCS: ID_LoaiCS,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật loại chỉ số", error });
  }
};

exports.deleteDuanLoaiCS = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Duan = userData.ID_Duan;
    const { ID_LoaiCS } = req.body;
    const duan = await Ent_duan.findByPk(ID_Duan);

    if (!duan) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const currentLoaiCS = duan.ID_LoaiCS || "";
    const toDelete = ID_LoaiCS.split(",");
    const updatedLoaiCS = currentLoaiCS
      .split(",")
      .filter((id) => !toDelete.includes(id))
      .join(",");

    await Ent_duan.update(
      { ID_LoaiCS: updatedLoaiCS },
      {
        where: { ID_Duan },
      }
    );

    res
      .status(200)
      .json({ message: "Xóa loại chỉ số thành công", updatedLoaiCS });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa loại chỉ số", error });
  }
};
