const { uploadFile } = require("../middleware/auth_google");
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

exports.createCheckListChiTiet = async (req, res, next) => {
  try {
    // Extract data from the request body
    let records = req.body;
    let images = req.files;

    if (!Array.isArray(records.ID_ChecklistC)) {
      // Corrected typo here
      // If req.body contains a single record, convert it to an array of one record
      records.ID_ChecklistC = [records.ID_ChecklistC];
      records.ID_Checklist = [records.ID_Checklist];
      records.Ketqua = [records.Ketqua];
      records.Gioht = [records.Gioht];
      records.Ghichu = [records.Ghichu];
      records.Anh = [records.Anh];
    }

    const uploadedFileIds = [];

    for (let f = 0; f < images.length; f += 1) {
      const fileId = await uploadFile(images[f]); // Upload file and get its id
      uploadedFileIds.push(fileId); // Push id to array
    }

    // Assuming all arrays in records have the same length
    const arrayLength = records.ID_ChecklistC.length;

    for (let i = 0; i < arrayLength; i++) {
      const ID_ChecklistC = records.ID_ChecklistC[i];
      const ID_Checklist = records.ID_Checklist[i];
      const Ketqua = records.Ketqua[i];
      const Gioht = records.Gioht[i];
      const Ghichu = records.Ghichu[i];
      let Anh = records.Anh[i];
      // const Anh = records.Anh[i];
      const matchingImage = uploadedFileIds.find(
        (file) => file.name === records.Anh[i]
      )?.id;
      if (matchingImage) {
        // If a matching image is found, set its path to the Anh property of the record
        Anh = matchingImage;
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
    res.status(200).json({ message: "Records created successfully" });
  } catch (error) {
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
            where: {
              ID_Khoi: { [Op.or]: [req.body.ID_KhoiCV, null] }, // Kiểm tra nếu ID_KhoiCV là giá trị mong muốn hoặc null
            },
            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
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
            res.status(200).json({
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
            res.status(200).json({
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
    const userData = req.user.data;
    const ID_Khuvuc = req.body.ID_Khuvuc;
    const ID_Tang = req.body.ID_Tang;
    const ID_Toanha = req.body.ID_Toanha;
    // Assuming fromDate and toDate are provided in the request body
    const fromDate = req.body.fromDate; 
    const toDate = req.body.toDate;
    const orConditions = [];
    if (userData) {
      orConditions.push({ "$tb_checklistc.ID_KhoiCV$": userData?.ID_KhoiCV });

      if (ID_Khuvuc !== null) {
        orConditions.push({ "$ent_checklist.ID_Khuvuc$": ID_Khuvuc });
      }

      if (ID_Tang !== null) {
        orConditions.push({ "$ent_checklist.ID_Tang$": ID_Tang });
      }

      if (ID_Toanha !== null) {
        orConditions.push({
          "$ent_checklist.ent_khuvuc.ID_Toanha$": ID_Toanha,
        });
      }

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
              "Ngay",
              "Giobd",
              "Giokt",
              "ID_KhoiCV",
              "ID_Giamsat",
              "ID_Calv",
            ],
            where: {
              Ngay: { [Op.between]: [fromDate, toDate] }, // Filter by Ngay attribute between fromDate and toDate
            },
            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
              },
              {
                model: Ent_giamsat,
                attributes: ["Hoten"],
              },
              {
                model: Ent_duan,
                attributes: ["Duan"],
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
                attributes: [
                  "Tenkhuvuc",
                  "MaQrCode",
                  "Makhuvuc",
                  "Sothutu",
                  "ID_Toanha",
                  "ID_Khuvuc",
                ],

                include: [
                  {
                    model: Ent_toanha,
                    attributes: ["Toanha", "Sotang"],
                  },
                ],
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
          [Op.and]: [orConditions],
        },
        order: [["ID_Checklistchitiet", "DESC"]],
      })
        .then((data) => {
          if (data) {
            res.status(200).json({
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

exports.uploadImages = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { body, files } = req;

    const uploadedFileIds = [];

    for (let f = 0; f < files.length; f += 1) {
      const fileId = await uploadFile(files[f]); // Upload file and get its id
      uploadedFileIds.push(fileId); // Push id to array
    }

    // Now you can use uploadedFileIds array to save ids to database or perform any other operations

    res.status(200).json({ message: "Form Submitted", uploadedFileIds });

    let records = req.body;
    let images = req.files;

    if (!Array.isArray(records.ID_ChecklistC)) {
      // Corrected typo here
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
      let Anh = records.Anh[i];
      // const Anh = records.Anh[i];
      const matchingImage = images.find(
        (image) => image.originalname === records.Anh[i]
      );
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
    res.status(200).json({ message: "Records created successfully" });
  } catch (err) {
    console.log("err", err);
  }
};
