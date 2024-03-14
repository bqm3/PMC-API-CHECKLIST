const {
    Ent_duan,
    Ent_calv,
    Ent_giamsat,
    Ent_khoicv,
    Tb_checklistc,
    Ent_checklist,
    Ent_chucvu,
    Tb_checklistchitiet,
    Ent_khuvuc,
    Ent_user,
    Ent_tang,
  } = require("../models/setup.model");
  
  exports.createCheckListChiTiet = async (req, res, next) => {
    try {
     
      if (
        !req.body.ID_ChecklistC ||
        !req.body.ID_Checklist ||
        !req.body.Ketqua ||
        !req.body.Gioht
      ) {
           res.status(400).send({
          message: "Phải nhập đầy đủ dữ liệu bao gồm ảnh checklist!",
        });
        return;
      }
      let pictureFiles = req.file;
      
    //   // Wait for all uploads to finish
      const imageUrl = await Promise.all([pictureFiles]);
      const data = {
        ID_ChecklistC: req.body.ID_ChecklistC,
        ID_Checklist: req.body.ID_Checklist,
        Ketqua: req.body.Ketqua,
        Anh: imageUrl[0]?.path ,
        Gioht: req.body.Gioht,
        Ghichu: req.body.Ghichu ? req.body.Ghichu : '',
        isDelete: 0,
      };
  
      Tb_checklistchitiet.create(data)
        .then((data) => {
          res.status(201).json({
            message: "Tạo dữ liệu thành công!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } catch (err) {
      return res.status(500).json({
        message: err.message || "Lỗi! Vui lòng thử lại sau.",
      });
    }
  };
  
  exports.getCheckListChiTiet = async (req, res, next) => {
    try {
      const userData = req.user.data;
      if (userData) {
        await Tb_checklistchitiet.findAll({
          attributes: [
            "ID_Checklistchitiet",
            "ID_ChecklistC",
            "ID_Checklist",
            "Ketqua",
            "Anh",
            "Gioht",
            "Ghichu",
            "isDelete",
          ],
          include: [
            {
              model: Tb_checklistc,
              attributes: ["ID_ChecklistC","Ngay", "Giobd","Giokt"],
            },
            {
                model: Ent_checklist,
                attributes: ["ID_Checklist", "ID_Khuvuc", "ID_Tang", "Sothutu",
            "Maso","MaQrCode", "Checklist", "Giatridinhdanh","Giatrinhan"],
                include: [
                  {
                    model: Ent_khuvuc,
                    attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
                
                  },
                  {
                    model: Ent_tang,
                    attributes: ["Tentang","Sotang"],
                
                  },
                  {
                    model: Ent_user,
                    attributes: ["UserName"],
                  },
                ],
            },
            
          ],
          where: {
            isDelete: 0,
          },
        })
          .then((data) => {
            if (data) {
              res.status(201).json({
                message: "Danh sách checklistc!",
                data: data,
              });
            } else {
              res.status(400).json({
                message: "Không có checklistc!",
                data: [],
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
        await Tb_checklistchitiet.findByPk(req.params.id, {
          attributes: [
            "ID_Checklistchitiet",
            "ID_ChecklistC",
            "ID_Checklist",
            "Ketqua",
            "Anh",
            "Gioht",
            "Ghichu",
            "isDelete",
          ],
          include: [
            {
              model: Tb_checklistc,
              attributes: ["ID_ChecklistC","Ngay", "Giobd","Giokt"],
            },
            {
                model: Ent_checklist,
                attributes: ["ID_Checklist", "ID_Khuvuc", "ID_Tang", "Sothutu",
            "Maso","MaQrCode", "Checklist", "Giatridinhdanh","Giatrinhan"],
                include: [
                  {
                    model: Ent_khuvuc,
                    attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
                
                  },
                  {
                    model: Ent_tang,
                    attributes: ["Tentang","Sotang"],
                
                  },
                  {
                    model: Ent_user,
                    attributes: ["UserName"],
                  },
                ],
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
  
  exports.searchChecklist = async(req, res) => {
    try{
      var options = {
        where: {
          $or: [
            { 'subject': { like: '%' + query + '%' } },
            { '$Comment.body$': { like: '%' + query + '%' } }
          ]
        },
        include: [{ model: Comment }]
      };
    }catch(err){
      return res.status(500).json({
        message: err.message || "Lỗi! Vui lòng thử lại sau.",
      });
    }
  }