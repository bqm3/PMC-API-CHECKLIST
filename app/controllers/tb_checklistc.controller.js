const {
    Ent_checklist,
    Ent_duan,
    Ent_calv,
    Ent_giamsat,
    Ent_khoicv,
  } = require("../models/setup.model");
  
  exports.create = (req, res,next) => {
    try {
      const userData = req.user.data;
      const anh1File = req.files['anh1'][0];
      console.log('anh1File', anh1File)
    //   if (userData) {
    //     if (
    //       !req.body.ID_Duan ||
    //       !req.body.ID_KhoiCV ||
    //       !req.body.Ngay ||
    //       !req.body.ID_Calv ||
    //       !req.body.ID_Giamsat ||
    //       !req.body.Giobd ||
    //       !req.body.Giochupanh1 ||
    //       !req.body.Anh1 ||
    //       !req.body.Giochupanh2 ||
    //       !req.body.Anh2 ||
    //       !req.body.Giochupanh3 ||
    //       !req.body.Anh3 ||
    //       !req.body.Giochupanh4 ||
    //       !req.body.Anh4 ||
    //       !req.body.Giokt ||
    //       !req.body.Ghichu ||
    //       !req.body.Tinhtrang
    //     ) {
    //       res.status(400).send({
    //         message: "Phải nhập đầy đủ dữ liệu!",
    //       });
    //       return;
    //     }
  
    //     const data = {
    //       ID_Duan: req.body.ID_Duan,
    //       ID_KhoiCV: req.body.ID_KhoiCV,
    //       Ngay: req.body.Ngay,
    //       ID_Calv: req.body.ID_Calv,
    //       ID_Giamsat: req.body.ID_Giamsat,
    //       Giobd: req.body.Giobd,
    //       Giochupanh1: req.body.Giochupanh1,
    //       Giatrinhan: req.body.Giatrinhan,
    //       ID_User: userData.ID_User,
    //       isDelete: 0,
    //     };
  
    //     Ent_checklist.create(data)
    //       .then((data) => {
    //         res.status(201).json({
    //           message: "Tạo checklist thành công!",
    //           data: data,
    //         });
    //       })
    //       .catch((err) => {
    //         res.status(500).send({
    //           message: err.message || "Lỗi! Vui lòng thử lại sau.",
    //         });
    //       });
    //   } else {
    //     return res.status(401).json({
    //       message: "Bạn không có quyền truy cập",
    //     });
    //   }
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
              attributes: ["Username", "Emails"],
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
      } else {
        return res.status(401).json({
          message: "Bạn không có quyền truy cập",
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
              attributes: ["Username", "Emails"],
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
  