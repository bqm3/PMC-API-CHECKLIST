const {
  Ent_duan,
  Ent_calv,
  Ent_giamsat,
  Ent_khoicv,
  Tb_checklistc,
  Ent_chucvu,
} = require("../models/setup.model");

exports.createCheckList = async (req, res, next) => {
  try {
   
    if (
      !req.body.ID_Duan ||
      !req.body.ID_KhoiCV ||
      !req.body.Ngay ||
      !req.body.ID_Calv ||
      !req.body.ID_Giamsat ||
      !req.body.Giobd ||
      !req.body.Giochupanh1 ||
      !req.body.Giochupanh2 ||
      !req.body.Giochupanh3 ||
      !req.body.Giochupanh4 ||
      !req.body.Giokt ||
      !req.body.Tinhtrang
    ) {
         res.status(400).send({
        message: "Phải nhập đầy đủ dữ liệu bao gồm cả 4 ảnh checklist!",
      });
      return;
    }
    let pictureFiles = req.files;
    const uploadPromises = pictureFiles.map(image => {return image});
    
    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);
    // Extract URLs from Cloudinary upload results
    const imageURLs = results.map(result => result.path);

    const data = {
      ID_Duan: req.body.ID_Duan,
      ID_KhoiCV: req.body.ID_KhoiCV,
      Ngay: req.body.Ngay,
      ID_Calv: req.body.ID_Calv,
      ID_Giamsat: req.body.ID_Giamsat,
      Giobd: req.body.Giobd,
      Giochupanh1: req.body.Giochupanh1,
      Anh1: imageURLs[0] ? imageURLs[0] : '',
      Giochupanh2: req.body.Giochupanh2,
      Anh2: imageURLs[1] ? imageURLs[1] : '',
      Giochupanh3: req.body.Giochupanh3,
      Anh3: imageURLs[2] ? imageURLs[2] : '',
      Giochupanh4: req.body.Giochupanh4,
      Anh4: imageURLs[3] ? imageURLs[3] : '',
      Giokt: req.body.Giokt,
      Ghichu: req.body.Ghichu || '',
      Tinhtrang: req.body.Tinhtrang,
      isDelete: 0,
    };

    Tb_checklistc.create(data)
      .then((data) => {
        res.status(201).json({
          message: "Tạo checklistc thành công!",
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

exports.getCheckListc = async (req, res, next) => {
  try {
    const userData = req.user.data;
    if (userData) {
      await Tb_checklistc.findAll({
        attributes: [
          "ID_ChecklistC",
          "ID_Duan",
          "ID_KhoiCV",
          "ID_Calv",
          "ID_Giamsat",
          "Ngay",
          "Giobd",
          "Giochupanh1",
          "Anh1",
          "Giochupanh2",
          "Anh2",
          "Giochupanh3",
          "Anh3",
          "Giochupanh4",
          "Anh4",
          "Giokt",
          "Ghichu",
          "Tinhtrang",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["ID_Duan","Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi","KhoiCV"],
          },
          {
            model: Ent_calv,
            attributes: ["ID_Calv","Tenca", "Giobatdau","Gioketthuc"],
          },
          {
            model: Ent_giamsat,
            attributes: ["ID_Giamsat","Hoten"],
            include: [
              {
                model: Ent_chucvu,
                attributes: ["Chucvu"],
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
      await Tb_checklistc.findByPk(req.params.id, {
        attributes: [
          "ID_ChecklistC",
          "ID_Duan",
          "ID_KhoiCV",
          "ID_Calv",
          "ID_Giamsat",
          "Ngay",
          "Giobd",
          "Giochupanh1",
          "Anh1",
          "Giochupanh2",
          "Anh2",
          "Giochupanh3",
          "Anh3",
          "Giochupanh4",
          "Anh4",
          "Giokt",
          "Ghichu",
          "Tinhtrang",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["ID_Duan","Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi","KhoiCV"],
          },
          {
            model: Ent_calv,
            attributes: ["ID_Calv","Tenca", "Giobatdau","Gioketthuc"],
          },
          {
            model: Ent_giamsat,
            attributes: ["ID_Giamsat","Hoten"],
            include: [
              {
                model: Ent_chucvu,
                attributes: ["Chucvu"],
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
              message: "Checklistc chi tiết!",
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