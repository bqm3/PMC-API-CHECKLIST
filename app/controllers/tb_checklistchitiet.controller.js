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
  Ent_toanha,
} = require("../models/setup.model");
const { Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;

exports.createCheckListChiTiet = async (req, res, next) => {
  try {
    // Extract data from the request body
    let records = req.body;
    let images = req.files;

    if (!Array.isArray(records.ID_ChecklistC)) { // Corrected typo here
      // If req.body contains a single record, convert it to an array of one record
      records.ID_ChecklistC = [records.ID_ChecklistC];
      records.ID_Checklist = [records.ID_Checklist];
      records.Ketqua = [records.Ketqua];
      records.Gioht = [records.Gioht];
      records.Ghichu = [records.Ghichu];
      records.Anh = [records.Anh];
    }
   
    // Assuming all arrays in records have the same length
    const arrayLength = records.ID_ChecklistC.length;
    
      for (let i = 0; i < arrayLength; i++) {
        const ID_ChecklistC = records.ID_ChecklistC[i];
        const ID_Checklist = records.ID_Checklist[i];
        const Ketqua = records.Ketqua[i];
        const Gioht = records.Gioht[i];
        const Ghichu = records.Ghichu[i];
        let Anh = records.Anh[i]
        // const Anh = records.Anh[i];
        const matchingImage = images.find(image => image.originalname === records.Anh[i]);
        if (matchingImage) {
          // If a matching image is found, set its path to the Anh property of the record
          Anh = matchingImage.path;
        }
         const newRecord = new Tb_checklistchitiet({
          ID_ChecklistC: ID_ChecklistC,
          ID_Checklist: ID_Checklist,
          Ketqua: Ketqua,
          Ghichu: Ghichu,
          Gioht: Gioht,
          Anh: Anh, // Assuming Anh is the image URL
        });
  
        await newRecord.save();
      
    }
    
    // Respond with success message
    res.status(201).json({ message: "Records created successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
            attributes: [
              "ID_ChecklistC",
              "Ngay",
              "Giobd",
              "Giokt",
              "ID_KhoiCV",
              "ID_Giamsat",
              "ID_Calv",
            ],
            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
                where: {
                  ID_Khoi: { [Op.or]: [req.body.ID_KhoiCV, null] }, // Kiểm tra nếu ID_KhoiCV là giá trị mong muốn hoặc null
                },
              },
              {
                model: Ent_giamsat,
                attributes: ["Hoten"],
              },
              {
                model: Ent_calv,
                attributes: ["Tenca", "Giobatdau", "Gioketthuc"],
              },
            ],
          },
          {
            model: Ent_checklist,
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
            ],
            include: [
              {
                model: Ent_khuvuc,
                attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
                where: {
                  ID_Khuvuc: { [Op.or]: [req.body.ID_Khuvuc, null] }, // Kiểm tra nếu ID_Khuvuc là giá trị mong muốn hoặc null
                },
                include: [
                  {
                    model: Ent_toanha,
                    attributes: ["Toanha", "Sotang"],
                    where: {
                      ID_Toanha: { [Op.or]: [req.body.ID_Toanha, null] }, // Kiểm tra nếu ID_Toanha là giá trị mong muốn hoặc null
                    },
                  },
                ],
              },
              {
                model: Ent_tang,
                attributes: ["Tentang", "Sotang"],
                where: {
                  ID_Tang: { [Op.or]: [req.body.ID_Tang, null] }, // Kiểm tra nếu ID_Tang là giá trị mong muốn hoặc null
                },
              },
              {
                model: Ent_user,
                attributes: ["UserName"],
              },
            ],
          },
        ],
        // where: {
        //     isDelete: 0,
        // },
      })
        .then((data) => {
          if (data) {
            res.status(201).json({
              message: "Danh sách checklistchitiet!",
              length: data.length,
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
            attributes: ["ID_ChecklistC", "Ngay", "Giobd", "Giokt"],
          },
          {
            model: Ent_checklist,
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
            ],
            include: [
              {
                model: Ent_khuvuc,
                attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
              },
              {
                model: Ent_tang,
                attributes: ["Tentang", "Sotang"],
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

exports.searchChecklist = async (req, res) => {
  try {
    var options = {
      where: {
        $or: [
          { subject: { like: "%" + query + "%" } },
          { "$Comment.body$": { like: "%" + query + "%" } },
        ],
      },
      include: [{ model: Comment }],
    };
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
