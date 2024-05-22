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
const { Op, where, Sequelize } = require("sequelize");
const ExcelJS = require("exceljs");
var path = require("path");

exports.createCheckListChiTiet = async (req, res, next) => {
  try {
    // Extract data from the request body and files
    const records = req.body;
    const images = req.files;

    // Ensure records.ID_ChecklistC and records.ID_Checklist are arrays
    const ensureArray = (data) => {
      if (!Array.isArray(data)) {
        return [data];
      }
      return data;
    };

    records.ID_ChecklistC = ensureArray(records.ID_ChecklistC);
    records.ID_Checklist = ensureArray(records.ID_Checklist);
    records.Ketqua = ensureArray(records.Ketqua);
    records.Ghichu = ensureArray(records.Ghichu);
    records.Gioht = ensureArray(records.Gioht);

    // Validate records and images as arrays
    if (records.ID_ChecklistC.length !== records.ID_Checklist.length) {
      return res.status(400).json({
        error: "ID_ChecklistC and ID_Checklist must have the same length.",
      });
    }

    // Upload images and collect file details (id and original name)
    const uploadedFileIds = [];
    for (const image of images) {
      const fileId = await uploadFile(image);
      await uploadedFileIds.push({ id: fileId, name: image.originalname });
    }


    // Prepare records for bulk creation
    const newRecords = records.ID_ChecklistC.map((ID_ChecklistC, index) => {
      const ID_Checklist = records.ID_Checklist[index];
      const Ketqua = records.Ketqua[index];
      const Gioht = records.Gioht[index];
      const Ghichu = records.Ghichu[index];

      // Handle Anh from records
      let Anh = null; // Default to null if no image is provided
      let inputAnh = Array.isArray(records.Anh) ? records.Anh[index] : records.Anh;

      if (inputAnh) {
        // Xác định `inputAnh` có phải là đối tượng hay không
        if (typeof inputAnh === 'object') {
            // Nếu `inputAnh` là đối tượng, lấy tên của đối tượng để so sánh
            inputAnh = inputAnh.name;
        }
    
        // Kiểm tra tệp ảnh đã tải lên
        const matchingImage = uploadedFileIds.find((file) => file.name === inputAnh);
    
        if (matchingImage) {
            // Sử dụng ID của tệp ảnh đã tải lên làm giá trị cho Anh
            Anh = matchingImage.id.id;
        } else {
            console.log(`No matching image found for Anh: ${inputAnh}`);
        }
    } else {
        console.log(`Unexpected Anh format: ${JSON.stringify(inputAnh)}`);
    }
    

      // Create the record object
      return {
        ID_ChecklistC,
        ID_Checklist,
        Ketqua,
        Gioht,
        Ghichu,
        Anh,
      };
    });

    // Bulk create new records
    await Tb_checklistchitiet.bulkCreate(newRecords);

    // Update `TongC` in `Tb_checklistc`
    await Tb_checklistc.update(
      { TongC: Sequelize.literal(`TongC + ${records.ID_ChecklistC.length}`) },
      {
        where: { ID_ChecklistC: records.ID_ChecklistC[0] },
      }
    );

    res.status(200).json({ message: "Records created successfully" });
  } catch (error) {
    // Log error and respond with internal server error
    console.error("Error creating checklist details:", error);
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
                    attributes: ["Toanha", "Sotang", "ID_Duan"],
                    where: {
                      ID_Toanha: { [Op.or]: [req.body.ID_Toanha, null] }, // Kiểm tra nếu ID_Toanha là giá trị mong muốn hoặc null
                    },
                    include: [
                      {
                        model: Ent_duan,
                        attributes: ["Duan"],
                      },
                    ],
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
                attributes: [
                  "Tenkhuvuc",
                  "MaQrCode",
                  "Makhuvuc",
                  "Sothutu",
                  "ID_Khuvuc",
                ],
                include: [
                  {
                    model: Ent_duan,
                    attributes: ["Duan"],
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
      const page = parseInt(req.query.page) || 0;
      const pageSize = parseInt(req.query.limit) || 100; // Số lượng phần tử trên mỗi trang
      const offset = page * pageSize;

      if (userData?.ID_KhoiCV !== null) {
        orConditions.push({ "$tb_checklistc.ID_KhoiCV$": userData?.ID_KhoiCV });
      }

      // orConditions.push({ "$tb_checklistc.ID_KhoiCV$": userData?.ID_KhoiCV });
      orConditions.push({ "$tb_checklistc.ID_Duan$": userData?.ID_Duan });

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

      const totalCount = await Tb_checklistchitiet.count({
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
        order: [[{ model: Tb_checklistc }, "Ngay", "DESC"]],
      });
      const totalPages = Math.ceil(totalCount / pageSize);
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
              "Tieuchuan",
              "Ghichu",
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
        order: [[{ model: Tb_checklistc }, "Ngay", "DESC"]],
        limit: pageSize,
        offset: offset,
      })
        .then((data) => {
          if (data) {
            res.status(200).json({
              message: "Danh sách checklistchitiet!",
              page: page,
              pageSize: pageSize,
              totalPages: totalPages,
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

exports.getCheckList = async (req, res, next) => {
  try {
    const userData = req.user.data;
    if (userData) {
      const page = req.query.page || 1; // Giả sử trang mặc định là trang 1
      const offset = (page - 1) * 100; // Tính toán offset
      const limit = 100; // Số lượng bản ghi mỗi trang

      await Tb_checklistchitiet.findAndCountAll({
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
        where: {
          isDelete: 0,
        },
        limit: limit,
        offset: offset,
      })
        .then((result) => {
          const { count, rows } = result;
          if (count > 0) {
            res.status(200).json({
              message: "Danh sách checklistchitiet!",
              totalItems: count,
              totalPages: Math.ceil(count / limit),
              currentPage: page,
              data: rows,
            });
          } else {
            res.status(404).json({
              message: "Không tìm thấy bản ghi nào!",
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

function getValue(obj, key) {
  const keys = key.split(".");
  let value = obj;
  keys.forEach((k) => {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      value = null;
    }
  });
  return value || "";
}

exports.getWriteExcel = async (req, res, next) => {
  try {
    const data = req.body.data;

    // Define the schema
    const schema = [
      {
        header: "Dự án",
        key: "tb_checklistc.ent_duan.Duan",
      },
      {
        header: "Tên tòa nhà",
        key: "ent_checklist.ent_khuvuc.ent_toanha.Toanha",
      },
      {
        header: "Mã khu vực",
        key: "ent_checklist.ent_khuvuc.ID_Khuvuc",
      },
      {
        header: "Mã QrCode khu vực",
        key: "ent_checklist.ent_khuvuc.MaQrCode",
      },
      {
        header: "Tên khu vực",
        key: "ent_checklist.ent_khuvuc.Tenkhuvuc",
      },
      {
        header: "Tên tầng",
        key: "ent_checklist.ent_tang.Tentang",
      },
      {
        header: "Tên khối công việc",
        key: "tb_checklistc.ent_khoicv.KhoiCV",
      },
      {
        header: "Số thứ tựu checklist",
        key: "ent_checklist.Sothutu",
      },
      {
        header: "Mã checklist",
        key: "ent_checklist.ID_Checklist",
      },
      {
        header: "Tên checklist",
        key: "ent_checklist.Checklist",
      },
      {
        header: "Tiêu chuẩn checklist",
        key: "ent_checklist.Tieuchuan",
      },
      {
        header: "Giá trị định danh",
        key: "ent_checklist.Giatridinhdanh",
      },
      {
        header: "Giá trị nhận",
        key: "ent_checklist.Giatrinhan",
      },
      {
        header: "Ghi chú",
        key: "ent_checklist.Ghichu",
      },
    ];

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set headers
    worksheet.columns = schema.map((col) => ({
      header: col.header,
      key: col.key,
    }));

    // Add data rows
    data.forEach((item) => {
      const rowData = {};
      schema.forEach((col) => {
        const value = getValue(item, col.key);
        rowData[col.key] = value;
      });
      worksheet.addRow(rowData);
    });

    // Generate Excel file
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding leading zero if needed
    const day = String(date.getDate()).padStart(2, "0"); // Adding leading zero if needed
    const totalSeconds =
      date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds(); // Convert time to total seconds
    const fileName = `${year}-${month}-${day}_${totalSeconds}.xlsx`; // Construct file name with timestamp

    const filePath = path.join(__dirname, "../public", fileName); // Construct file path with timestamp

    await workbook.xlsx.writeFile(filePath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    return res
      .status(200)
      .json({ message: "Excel file saved successfully.", filePath: filePath });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Lỗi! Vui lòng thử lại sau." });
  }
};