const {
  Ent_checklist,
  Ent_khuvuc,
  Ent_tang,
  Ent_user,
  Ent_chucvu,
  Ent_toanha,
  Ent_khoicv,
  Ent_duan,
} = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      if (
        // !req.body.ID_Khuvuc ||
        // !req.body.ID_Tang ||
        // !req.body.Sothutu ||
        // !req.body.Maso ||
        // !req.body.MaQrCode ||
        !req.body.Checklist
        // !req.body.Giatridinhdanh ||
        // !req.body.Giatrinhan
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
        Ghichu: req.body.Ghichu,
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
          "Ghichu",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
            attributes: [
              "Tenkhuvuc",
              "MaQrCode",
              "Makhuvuc",
              "Sothutu",
              "ID_Toanha",
              "ID_KhoiCV",
              "ID_Khuvuc"
            ],
            include: [
              {
                model: Ent_toanha,
                attributes: ["Toanha", "Sotang", "ID_Toanha"],
                
                include: {
                  model: Ent_duan,
                  attributes: ["ID_Duan", "Duan"],
                  // Điều kiện tìm kiếm dựa trên ID_Duan
                },
                where: { ID_Duan: userData.ID_Duan }, 
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
        if (data && data.length > 0) {
          let arrNew = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].ent_khuvuc !== null) {
              arrNew.push(data[i]);
            }
          }
          if (arrNew.length > 0) {
          //   const processedData = arrNew.map(item => {
          //     return { ...item, Giatrinhan: item.Giatrinhan.split('/') };
          // });
            res.status(200).json({
              message: "Danh sách checklist!",
              length: arrNew.length,
              data: arrNew,
            });
          } else {
            res.status(404).json({
              message: "Không tìm thấy checklist cho dự án này!",
              data: [],
            });
          }
        } else {
          res.status(404).json({
            message: "Không tìm thấy checklist cho dự án này!",
            data: [],
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
          "Ghichu",
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

exports.update = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      if (!req.body.Giatrinhan || !req.body.Checklist) {
        res.status(400).send({
          message: "Cần nhập đầy đủ thông tin!",
        });
        return;
      }
      const reqData = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        Sothutu: req.body.Sothutu,
        Maso: req.body.Maso,
        MaQrCode: req.body.MaQrCode,
        Checklist: req.body.Checklist,
        Ghichu: req.body.Ghichu,
        Giatridinhdanh: req.body.Giatridinhdanh,
        Giatrinhan: req.body.Giatrinhan,
        Sothutu: req.body.Sothutu,
        isDelete: 0,
      };

      Ent_checklist.update(reqData, {
        where: {
          ID_Checklist: req.params.id,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Cập nhật checklist thành công!",
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_checklist.update(
        { isDelete: 1 },
        {
          where: {
            ID_Checklist: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(201).json({
            message: "Xóa checklist thành công!",
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getFilter = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Khuvuc = req.body.ID_Khuvuc;
    const ID_Tang = req.body.ID_Tang;
    const ID_KhoiCV = req.body.ID_KhoiCV;
    const ID_Toanha = req.body.ID_Tang;

    if (userData) {
      const whereCondition = {
        [Op.or]: [],
      };
      if (ID_Khuvuc == null && ID_Tang == null) {
      }
      // Xây dựng điều kiện where dựa trên các giá trị đã kiểm tra

      // if (ID_Khuvuc !== undefined) {
      //   whereCondition[Op.or].push({
      //     ID_Khuvuc: ID_Khuvuc,
      //   });
      // }
      // if (ID_Tang !== undefined) {
      //   whereCondition[Op.or].push({
      //     ID_Tang: ID_Tang,
      //   });
      // }
      whereCondition.isDelete = 0;

      await Ent_checklist.findAll({
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Tang",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Ghichu",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
            attributes: [
              "Tenkhuvuc",
              "MaQrCode",
              "Makhuvuc",
              "Sothutu",
              "ID_Toanha",
              "ID_KhoiCV",
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
        // where: whereCondition,
        // where: {
        //   "$or": {
        //     '$Ent_checklist.ID_Khuvuc$': ID_Khuvuc,
        //     '$Ent_tang.ID_Tang$': ID_Tang,
        //     '$Ent_khuvuc.Ent_toanha.ID_Toanha$': ID_Toanha,
        //     '$Ent_khuvuc.Ent_khoicv.ID_Khoi$': ID_KhoiCV,
        //   }
        // }
        where: []
      })
        .then((data) => {
          res.status(201).json({
            message: "Thông tin khu vực!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
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
    res.status(500).send({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.deleteChecklists = async (req, res) => {
  try {
    const ids = req.params.ids.split(",");
    const userData = req.user.data;

    if (ids && userData) {
      Ent_checklist.update(
        { isDelete: 1 },
        {
          where: {
            ID_Checklist: ids,
          },
        }
      )
        .then((data) => {
          res.status(201).json({
            message: "Xóa checklist thành công!",
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
