const { Ent_giamsat, Ent_duan, Ent_chucvu } = require("../models/setup.model");

exports.create = (req, res) => {
  // Validate request
  try {
    if (
      !req.body.ID_Duan ||
      !req.body.Hoten ||
      !req.body.ID_Chucvu ||
      !req.body.iQuyen 
    ) {
      res.status(400).send({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }
    const userData = req.user.data;
    if (userData) {
      const data = {
        ID_Duan: req.body.ID_Duan,
        Hoten: req.body.Hoten,
        ID_Chucvu: req.body.ID_Chucvu,
        iQuyen: req.body.iQuyen,
        isDelete: 0,
      };

      Ent_giamsat.create(data)
        .then((data) => {
          res.status(201).json({
            message: "Tạo giám sát thành công!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
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

exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      await Ent_giamsat.findAll({
        attributes: [
          "ID_Giamsat",
          "ID_Duan",
          "ID_Chucvu",
          "Hoten",
          "iQuyen",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Danh sách giám sát!",
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
    if (req.params.id && userData) {
      await Ent_giamsat.findByPk(req.params.id, {
        attributes: [
            "ID_Giamsat",
            "ID_Duan",
            "ID_Chucvu",
            "Hoten",
            "iQuyen",
            "isDelete",
        ],
        include: [
            {
              model: Ent_duan,
              attributes: ["Duan"],
            },
            {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
          ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Giám sát chi tiết!",
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
