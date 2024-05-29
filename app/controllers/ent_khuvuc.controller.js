const { Ent_toanha, Ent_khuvuc, Ent_khoicv } = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  // Validate request
  try {
    if (!req.body.ID_Toanha || !req.body.ID_KhoiCV || !req.body.Tenkhuvuc) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
    }
    const userData = req.user.data;

    if (userData) {
      const ID_User = userData.ID_User;
      const data = {
        ID_Toanha: req.body.ID_Toanha,
        ID_KhoiCV: req.body.ID_KhoiCV,
        Sothutu: req.body.Sothutu,
        Makhuvuc: req.body.Makhuvuc,
        MaQrCode: req.body.MaQrCode,
        Tenkhuvuc: req.body.Tenkhuvuc,
        ID_User: ID_User,
        isDelete: 0,
      };
      if (req.body.MaQrCode !== "") {
        const dataRes = await Ent_khuvuc.findOne({
          where: {
            MaQrCode: req.body.MaQrCode,
          },
          attributes: [
            "ID_Khuvuc",
            "ID_Toanha",
            "ID_KhoiCV",
            "Sothutu",
            "Makhuvuc",
            "MaQrCode",
            "Tenkhuvuc",
            "ID_User",
            "isDelete",
          ],
        });

        if (dataRes !== null) {
          return res.status(401).json({
            message: "Mã QrCode đã bị trùng",
          });
        } else {
          Ent_khuvuc.create(data)
            .then((data) => {
              res.status(200).json({
                message: "Tạo khu vực thành công!",
                data: data,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: err.message || "Lỗi! Vui lòng thử lại sau.",
              });
            });
        }
      } else {
        Ent_khuvuc.create(data)
          .then((data) => {
            res.status(200).json({
              message: "Tạo khu vực thành công!",
              data: data,
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: err.message || "Lỗi! Vui lòng thử lại sau.",
            });
          });
      }
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
    const orConditions = [];
    let whereCondition = {
      isDelete: 0,
    };
    if (userData) {
      orConditions.push({ "$ent_toanha.ID_Duan$": userData?.ID_Duan });
      if (userData?.ID_KhoiCV !== null && userData?.ID_KhoiCV !== undefined ) {
        whereCondition.ID_KhoiCV = userData?.ID_KhoiCV;
      }
      await Ent_khuvuc.findAll({
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "Sothutu",
          "Makhuvuc",
          "MaQrCode",
          "Tenkhuvuc",
          "ID_User",
          "isDelete",
        ],
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
        where: [
          whereCondition,
          {
            [Op.and]: [orConditions],
          },
        ],
        order: [
          ["ID_Toanha", "ASC"],
        ],
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách khu vực!",
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
      await Ent_khuvuc.findByPk(req.params.id, {
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "Sothutu",
          "Makhuvuc",
          "MaQrCode",
          "Tenkhuvuc",
          "ID_User",
          "isDelete",
        ],
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
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Khu vực chi tiết!",
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
      const reqData = {
        ID_Toanha: req.body.ID_Toanha,
        ID_KhoiCV: req.body.ID_KhoiCV,
        Sothutu: req.body.Sothutu,
        Makhuvuc: req.body.Makhuvuc,
        MaQrCode: req.body.MaQrCode,
        Tenkhuvuc: req.body.Tenkhuvuc,
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      // Kiểm tra xem mã QR Code có rỗng không
      if (req.body.MaQrCode && req.body.MaQrCode.trim() !== "") {
        // Kiểm tra xem mã QR Code mới có trùng với bất kỳ bản ghi nào khác trong cơ sở dữ liệu không
        const existingKhuvuc = await Ent_khuvuc.findOne({
          where: {
            [Op.and]: [
              { MaQrCode: { [Op.not]: null, [Op.ne]: "" } }, // Kiểm tra mã QR Code không rỗng hoặc null
              { ID_Khuvuc: { [Op.ne]: req.params.id } }, // Kiểm tra ID_Khuvuc khác với ID của khu vực đang cập nhật
              { MaQrCode: req.body.MaQrCode }, // Kiểm tra xem mã QR Code mới có trùng với mã QR Code được gửi trong yêu cầu không
            ],
          },
          attributes: [
            "ID_Khuvuc",
            "ID_Toanha",
            "ID_KhoiCV",
            "Sothutu",
            "Makhuvuc",
            "MaQrCode",
            "Tenkhuvuc",
            "ID_User",
            "isDelete",
          ],
        });

        if (existingKhuvuc) {
          res.status(400).json({
            message: "Mã QR Code đã tồn tại!",
          });
          return;
        }
      }

      // Thực hiện cập nhật khu vực
      Ent_khuvuc.update(reqData, {
        where: {
          ID_Khuvuc: req.params.id,
        },
      })
        .then((data) => {
          console.log("data", data);
          res.status(200).json({
            message: "Cập nhật khu vực thành công!",
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


exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_khuvuc.update(
        { isDelete: 1 },
        {
          where: {
            ID_Khuvuc: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa khu vực thành công!",
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

exports.getKhuVuc = async (req, res) => {
  try {
    const userData = req.user.data;

    if (userData) {
      // Xây dựng điều kiện where dựa trên các giá trị đã kiểm tra
      const whereCondition = {
        [Op.and]: [],
      };

      if (userData.Permission === 3 || userData.UserName === "PSH") {
        // Nếu userData.Permission == 1, không cần thêm điều kiện where, lấy tất cả khu vực
      } else {
        // Nếu userData.Permission !== 1, thêm điều kiện where theo ID_KhoiCV và ID_Duan
        if (userData.ID_Duan !== null) {
          whereCondition["$ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }
        if (userData.ID_KhoiCV !== null  && userData.ID_KhoiCV !== undefined) {
          whereCondition[Op.and].push({
            ID_KhoiCV: userData.ID_KhoiCV,
          });
        }

        if (req.body.ID_Toanha !== null && req.body.ID_Toanha !== undefined) {
          whereCondition[Op.and].push({
            ID_Toanha: req.body.ID_Toanha,
          });
        }
      }
      // Thêm điều kiện isDelete
      whereCondition.isDelete = 0;

      Ent_khuvuc.findAll({
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "Sothutu",
          "Makhuvuc",
          "MaQrCode",
          "Tenkhuvuc",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_toanha,
            attributes: ["Toanha", "Sotang", "ID_Toanha"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
        ],
        where: whereCondition,
        order: [
          ["ID_Toanha", "ASC"],
          ["ID_KhoiCV", "ASC"],
        ]
      })
        .then((data) => {
          res.status(200).json({
            message: "Thông tin khu vực!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else {
      // Trả về lỗi nếu không có dữ liệu người dùng hoặc không có ID được cung cấp
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất một trong hai ID.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.filterByQr = async (req, res) => {
  try {
    const userData = req.user.data;

    if (userData) {
      // Xây dựng điều kiện where dựa trên các giá trị đã kiểm tra
      const whereCondition = {
        [Op.and]: [],
      };

      if (userData.Permission === 3 || userData.UserName === "PSH") {
        // Nếu userData.Permission == 1, không cần thêm điều kiện where, lấy tất cả khu vực
      } else {
        // Nếu userData.Permission !== 1, thêm điều kiện where theo ID_KhoiCV và ID_Duan
        if (userData.ID_Duan !== null) {
          whereCondition["$ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }
        if (userData.ID_KhoiCV !== null) {
          whereCondition["$ID_KhoiCV$"] = userData.ID_KhoiCV;
        }
       
      }
      // Thêm điều kiện isDelete
      whereCondition.isDelete = 0;
      whereCondition.MaQrCode = req.body.MaQrCode;
      Ent_khuvuc.findOne({
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "MaQrCode",
          "Sothutu",
          "Makhuvuc",
          "Tenkhuvuc",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_toanha,
            attributes: ["Toanha", "Sotang", "ID_Toanha"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
        ],
        where: whereCondition,
      })
        .then((data) => {
          res.status(200).json({
            message: "Thông tin tòa nhà!",
            data: data ?  [data] : [],
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else {
      // Trả về lỗi nếu không có dữ liệu người dùng hoặc không có ID được cung cấp
      return res.status(400).json({
        message: "Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
