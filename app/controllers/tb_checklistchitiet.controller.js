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
  beboi,
} = require("../models/setup.model");
const sequelize = require("../config/db.config");
const { Op, where, Sequelize } = require("sequelize");
const ExcelJS = require("exceljs");
const cron = require("node-cron");
var path = require("path");
const { sendToQueue } = require("../queue/producer.checklist");

const ensureArray = (data) => {
  if (!Array.isArray(data)) {
    return [data];
  }
  return data;
};

const processImageUpload = async (index, ID_Checklist, uploadedFiles) => {
  let anhs = [];
  for (let i = 0; i < 15; i++) {
    // Giả sử tối đa 15 ảnh mỗi record
    const imageIndex = `Images_${index}_${ID_Checklist}_${i}`;
    const matchingImage = uploadedFiles?.find(
      (file) => file.fieldname === imageIndex
    );
    if (matchingImage) {
      anhs.push(matchingImage.fileId.id);
    }
  }
  return anhs;
};

exports.createCheckListChiTiet = async (req, res, next) => {
  try {
    const records = req.body;
    const userData = req.user.data;
    const uploadedFiles = req.uploadedFiles || [];

    records.ID_ChecklistC = ensureArray(records.ID_ChecklistC);
    records.ID_Checklist = ensureArray(records.ID_Checklist);
    records.ID_Phanhe = ensureArray(records.ID_Phanhe);
    records.Vido = ensureArray(records.Vido);
    records.Kinhdo = ensureArray(records.Kinhdo);
    records.Docao = ensureArray(records.Docao);
    records.Ketqua = ensureArray(records.Ketqua);
    records.Ghichu = ensureArray(records.Ghichu);
    records.Key_Image = ensureArray(records.Key_Image);
    records.Gioht = ensureArray(records.Gioht);
    records.isScan = ensureArray(records.isScan);
    records.isCheckListLai = ensureArray(records?.isCheckListLai);

    if (records.ID_ChecklistC.length !== records.ID_Checklist.length) {
      return res.status(400).json({
        error: "ID_ChecklistC and ID_Checklist must have the same length.",
      });
    }

    const dynamicTableName = `tb_checklistchitiet_${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}_${new Date().getFullYear()}`;

    const processValue = (data) =>
      data !== "null" && data !== undefined && data !== "" ? data : null;
    // Gom tất cả ID_Phanhe = 3 thành một mảng riêng
    const checklistPhanheBeboi = records.ID_Phanhe.map((val, index) =>
      val == 3
        ? {
            index,
            ID_ChecklistC: records.ID_ChecklistC[0],
            ID_Checklist: records.ID_Checklist[index],
            ID_Phanhe: processValue(records.ID_Phanhe[index]) || null,
            Ketqua: processValue(records.Ketqua[index]) || null,
            Gioht: processValue(records.Gioht[index]),
            Ghichu: processValue(records.Ghichu[index]),
          }
        : null
    ).filter((item) => item !== null);

    const newRecords = await Promise.all(
      records.ID_Checklist.map(async (ID_Checklist, index) => {
        const anhs = await processImageUpload(
          index,
          ID_Checklist,
          uploadedFiles
        );

        return {
          ID_ChecklistC: records.ID_ChecklistC[0],
          ID_Checklist,
          ID_Phanhe: processValue(records.ID_Phanhe[index]) || null,
          Vido: processValue(records.Vido[index]) || null,
          Kinhdo: processValue(records.Kinhdo[index]) || null,
          Docao: processValue(records.Docao[index]) || null,
          Ketqua: processValue(records.Ketqua[index]) || null,
          Gioht: processValue(records.Gioht[index]),
          Ghichu: processValue(records.Ghichu[index]),
          isScan: processValue(records.isScan[index]),
          Anh: anhs.length > 0 ? anhs.join(",") : null,
          Ngay: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
          isCheckListLai: processValue(records.isCheckListLai[index]) || 0,
        };
      })
    );

    const transaction = await sequelize.transaction();

    try {
      const { status, message } = await insertCheckListPhanheBeboi(
        userData,
        checklistPhanheBeboi
      );

      await insertIntoDynamicTable(dynamicTableName, newRecords, transaction);
      await transaction.commit();

      res.status(200).json({
        message: status === "error" ? message : "Checklist thành công",
      });

      const backgroundTask = {
        records: newRecords,
        dynamicTableName,
      };
      await sendToQueue(backgroundTask);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: "Failed to create checklist details" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const insertCheckListPhanheBeboi = async (userData, checklistPhanheBeboi) => {
  try {
    const dataToInsert = [];
    const allMessages = [];

    const tinhChenhLech = (baseValue, ketqua, nguong, label) => {
      const chenhLech = ketqua - baseValue;
      const percentDiff = ((chenhLech / baseValue) * 100).toFixed(2);

      if (chenhLech > nguong) {
        return `Giá trị tăng ${Math.abs(
          percentDiff
        )}% so với ${label}, vượt ngưỡng ${nguong}`;
      } else if (chenhLech < -nguong) {
        return `Giá trị giảm ${Math.abs(
          percentDiff
        )}% so với ${label}, vượt ngưỡng ${nguong}`;
      }
      return null;
    };

    for (const item of checklistPhanheBeboi) {
      const { ID_Checklist, ID_ChecklistC, Ketqua, Gioht } = item;

      const checklistInfo = await Ent_checklist.findOne({
        where: { ID_Checklist },
        attributes: [
          "Checklist",
          "ID_Loaisosanh",
          "isCanhbao",
          "Giatrisosanh",
          "Giatriloi",
          "Giatridinhdanh",
        ],
      });

      if (!checklistInfo) {
        allMessages.push(`Không tìm thấy checklist: ${ID_Checklist}`);
        continue;
      }

      const {
        Checklist,
        ID_Loaisosanh,
        Giatrisosanh,
        Giatriloi,
        Giatridinhdanh,
      } = checklistInfo;

      let MessageLoi = null;

      if (ID_Loaisosanh === 1 && Giatrisosanh !== null && Giatriloi !== null) {
        MessageLoi = tinhChenhLech(
          Giatrisosanh,
          Ketqua,
          Giatriloi,
          "giá trị chuẩn"
        );
      }

      if (ID_Loaisosanh === 2 && Giatriloi !== null) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const YYYYMMDD = `${yesterday.getFullYear()}-${(
          yesterday.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${yesterday
          .getDate()
          .toString()
          .padStart(2, "0")}`;

        const prevRecord = await beboi.findOne({
          where: {
            ID_Checklist,
            createdAt: {
              [Op.gte]: `${YYYYMMDD} 00:00:00`,
              [Op.lte]: `${YYYYMMDD} 23:59:59`,
            },
          },
          order: [["createdAt", "DESC"]],
        });

        const nguong = Giatriloi * 10;

        if (prevRecord && prevRecord.Giatrighinhan !== null) {
          MessageLoi = tinhChenhLech(
            prevRecord.Giatrighinhan,
            Ketqua,
            nguong,
            "hôm trước"
          );
        } else if (Giatrisosanh !== null) {
          MessageLoi = tinhChenhLech(
            Giatrisosanh,
            Ketqua,
            nguong,
            "giá trị chuẩn"
          );
        } else {
          MessageLoi = `Không có dữ liệu hôm trước và cũng không có giá trị chuẩn để so sánh`;
        }
      }

      if (MessageLoi) {
        allMessages.push(`${Checklist}: ${MessageLoi}`);
      }

      dataToInsert.push({
        Nguoi_tao: userData?.UserName || userData.Email || "unknown",
        ID_Duan: userData?.ID_Duan,
        ID_Checklist,
        ID_ChecklistC,
        Giatrighinhan: Ketqua,
        ID_Loaisosanh,
        Gioht,
        Giatridinhdanh,
        Giatrisosanh,
        Giatriloi,
        Ngay_ghi_nhan: new Date().toISOString(),
      });
    }

    if (dataToInsert.length > 0) {
      await beboi.bulkCreate(dataToInsert);
    }

    let htmlResponse = null;

    if (allMessages.length > 0) {
      htmlResponse = `
        <div>
          <h2>Cảnh báo kiểm tra bể bơi:</h2>
          <ul>
            ${allMessages.map((msg) => `<li>${msg}</li>`).join("")}
          </ul>
        </div>`;
    }

    return {
      status: allMessages.length > 0 ? "error" : "success",
      message: htmlResponse || "Checklist bể bơi đã được ghi nhận thành công.",
    };
  } catch (err) {
    console.error("❌ Lỗi khi insert checklist bể bơi:", err);
    return { status: "error", message: err.message };
  }
};

const insertIntoDynamicTable = async (tableName, records, transaction) => {
  const query = `
    INSERT INTO ${tableName}
      (ID_ChecklistC, ID_Checklist, Vido, Kinhdo, Docao, Ketqua, Gioht, Ghichu, isScan, Anh, Ngay, isCheckListLai)
    VALUES
      ?`;
  const values = records.map((record) => [
    record.ID_ChecklistC,
    record.ID_Checklist,
    record.Vido || null,
    record.Kinhdo || null,
    record.Docao || null,
    record.Ketqua || null,
    record.Gioht || null,
    record.Ghichu || null,
    record.isScan || null,
    record.Anh || null,
    record.Ngay || null,
    record.isCheckListLai || 0,
  ]);

  await sequelize.query(query, {
    replacements: [values],
    type: sequelize.QueryTypes.INSERT,
    transaction,
  });
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
            as: "tb_checklistc",
            attributes: [
              "ID_ChecklistC",
              "Ngay",
              "Giobd",
              "Gioghinhan",
              "Giokt",
              "ID_KhoiCV",
              "ID_Calv",
            ],
            where: {
              ID_KhoiCV: { [Op.or]: [req.body.ID_KhoiCV, null] }, // Kiểm tra nếu ID_KhoiCV là giá trị mong muốn hoặc null
            },
            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV", "Ngaybatdau", "Chuky"],
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
              "isCheck",
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
                model: Ent_user,
                attributes: ["UserName", "Hoten", "Sodienthoai", "Email"],
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
            attributes: [
              "ID_ChecklistC",
              "Ngay",
              "Giobd",
              "Gioghinhan",
              "Giokt",
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
              "isCheck",
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
              },

              {
                model: Ent_user,
                attributes: ["UserName", "Hoten", "Sodienthoai", "Email"],
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

      if (userData?.ID_KhoiCV !== null && userData?.ID_KhoiCV !== undefined) {
        orConditions.push({ "$tb_checklistc.ID_KhoiCV$": userData?.ID_KhoiCV });
      }

      // orConditions.push({ "$tb_checklistc.ID_KhoiCV$": userData?.ID_KhoiCV });
      orConditions.push({ "$tb_checklistc.ID_Duan$": userData?.ID_Duan });

      if (ID_Khuvuc !== null && ID_Khuvuc !== undefined) {
        orConditions.push({ "$ent_checklist.ID_Khuvuc$": ID_Khuvuc });
      }

      if (ID_Tang !== null && ID_Tang !== undefined) {
        orConditions.push({ "$ent_checklist.ID_Tang$": ID_Tang });
      }

      if (ID_Toanha !== null && ID_Toanha !== undefined) {
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
            as: "tb_checklistc",
            attributes: [
              "Ngay",
              "Giobd",
              "Gioghinhan",
              "Giokt",
              "ID_KhoiCV",
              "ID_Calv",
            ],
            where: {
              Ngay: { [Op.between]: [fromDate, toDate] }, // Filter by Ngay attribute between fromDate and toDate
            },

            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV", "Ngaybatdau", "Chuky"],
              },
              {
                model: Ent_duan,
                attributes: ["Duan"],
              },
              {
                model: Ent_calv,
                attributes: ["Tenca", "Giobatdau", "Gioketthuc"],
              },
              {
                model: Ent_user,
                attributes: ["UserName", "Hoten", "Sodienthoai", "Email"],
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
              "isCheck",
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
            ],
          },
        ],
        where: {
          isDelete: 0,
          [Op.and]: [orConditions],
        },
        // order: [[{ model: Tb_checklistc }, "Ngay", "DESC"]],
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
            as: "tb_checklistc",
            attributes: [
              "Ngay",
              "Giobd",
              "Gioghinhan",
              "Giokt",
              "ID_KhoiCV",
              "ID_Calv",
            ],
            where: {
              Ngay: { [Op.between]: [fromDate, toDate] }, // Filter by Ngay attribute between fromDate and toDate
            },

            include: [
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV", "Ngaybatdau", "Chuky"],
              },

              {
                model: Ent_duan,
                attributes: ["Duan"],
              },
              {
                model: Ent_calv,
                attributes: ["Tenca", "Giobatdau", "Gioketthuc"],
              },
              {
                model: Ent_user,
                attributes: ["UserName", "Hoten", "Sodienthoai", "Email"],
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
              "isCheck",
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
            ],
          },
        ],
        where: {
          isDelete: 0,
          [Op.and]: [orConditions],
        },
        order: [
          ["Ngay", "DESC"],
          ["Gioht", "DESC"],
        ],
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

cron.schedule("0 * * * *", async function () {
  console.log("---------------------");
  console.log("Running Cron Job");

  const currentDateTime = new Date();
  const currentDateString = currentDateTime.toISOString().split("T")[0];

  // Tính toán ngày hiện tại trừ đi 1 ngày
  const yesterdayDateTime = new Date(currentDateTime);
  yesterdayDateTime.setDate(currentDateTime.getDate() - 1);
  const yesterdayDateString = yesterdayDateTime.toISOString().split("T")[0];

  try {
    // Tìm các bản ghi thoả mãn điều kiện
    const results = await Tb_checklistchitiet.findAll({
      attributes: [
        "ID_ChecklistC",
        "ID_Checklistchitiet",
        "ID_Checklist",
        "Ketqua",
        "Anh",
        "Ngay",
        "Gioht",
        "Ghichu",
        "isDelete",
      ],
      where: {
        isDelete: 0,
        Ngay: {
          [Op.lte]: new Date(currentDateString),
          [Op.gte]: new Date(yesterdayDateString),
        },
      },
    });

    // Lọc ra các bản ghi trùng lặp
    const seen = new Map();
    const duplicates = [];

    results.forEach((record) => {
      const key = `${record.ID_Checklist}_${record.ID_ChecklistC}_${record.Gioht}`;
      if (seen.has(key)) {
        duplicates.push(record);
      } else {
        seen.set(key, record);
      }
    });

    // Xóa các bản ghi trùng lặp và cập nhật số lượng đã xóa
    const deletePromises = duplicates.map((record) =>
      Tb_checklistchitiet.destroy({
        where: { ID_Checklistchitiet: record.ID_Checklistchitiet },
      })
    );
    await Promise.all(deletePromises);

    // Đếm số lượng bản ghi trùng lặp đã xóa theo từng ID_ChecklistC
    const deletedCountByChecklistC = duplicates.reduce((acc, record) => {
      if (!acc[record.ID_ChecklistC]) {
        acc[record.ID_ChecklistC] = 0;
      }
      acc[record.ID_ChecklistC]++;
      return acc;
    }, {});

    // Cập nhật lại bảng tb_checklistc
    const updatePromises = Object.entries(deletedCountByChecklistC).map(
      ([ID_ChecklistC, count]) =>
        Tb_checklistc.update(
          { TongC: Sequelize.literal(`TongC - ${count}`) },
          { where: { ID_ChecklistC } }
        )
    );
    await Promise.all(updatePromises);

    console.log("Cron job completed successfully");
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});
