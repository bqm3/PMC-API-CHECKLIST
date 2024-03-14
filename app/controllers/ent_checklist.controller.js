const {
  Ent_checklist,
  Ent_khuvuc,
  Ent_tang,
  Ent_user,
  Ent_chucvu,
  Ent_toanha,
  Ent_khoicv,
} = require("../models/setup.model");

exports.create = (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      if (
        !req.body.ID_Khuvuc ||
        !req.body.ID_Tang ||
        !req.body.Sothutu ||
        !req.body.Maso ||
        !req.body.MaQrCode ||
        !req.body.Checklist ||
        !req.body.Giatridinhdanh ||
        !req.body.Giatrinhan
      ) {
        res.status(400).send({
          message: "Phải nhập đầy đủ dữ liệu!",
        });
        return;
      }

      const data = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        Sothutu: req.body.Sothutu,
        Maso: req.body.Maso,
        MaQrCode: req.body.MaQrCode,
        Checklist: req.body.Checklist,
        Giatridinhdanh: req.body.Giatridinhdanh,
        Giatrinhan: req.body.Giatrinhan,
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      Ent_checklist.create(data)
        .then((data) => {
          res.status(201).json({
            message: "Tạo checklist thành công!",
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
      await Ent_checklist.findAll({
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Tang",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
            attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
            include: [
              {
                model: Ent_toanha,
                attributes: ["Toanha", "Sotang"],
              },
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
              },
            ],
          },
          {
            model: Ent_tang,
            attributes: ["Tentang", "Sotang"],
          },
          {
            model: Ent_user,
            include: {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
            attributes: ["UserName", "Emails"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          if (data) {
            res.status(201).json({
              message: "Danh sách checklist!",
              data: data,
            });
          } else {
            res.status(400).json({
              message: "Không có checklist!",
              data:[]
            });
          }
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
      await Ent_checklist.findByPk(req.params.id, {
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Tang",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
            attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
            include: [
              {
                model: Ent_toanha,
                attributes: ["Toanha", "Sotang"],
              },
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
              },
            ],
          },
          {
            model: Ent_tang,
            attributes: ["Tentang", "Sotang"],
          },
          {
            model: Ent_user,
            include: {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
            attributes: ["UserName", "Emails"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          if (data) {
            res.status(201).json({
              message: "Checklist chi tiết!",
              data: data,
            });
          } else {
            res.status(400).json({
              message: "Không có checklist cần tìm!",
            });
          }
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
