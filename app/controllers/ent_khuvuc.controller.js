const {
  Ent_toanha,
  Ent_khuvuc,
  Ent_khoicv,
  Ent_duan,
  Ent_hangmuc,
  Ent_tang,
  Ent_checklist,
} = require("../models/setup.model");
const { Op, Sequelize, fn, col, literal, where } = require("sequelize");
const sequelize = require("../config/db.config");
const xlsx = require("xlsx");

exports.create = async (req, res) => {
  // Validate request
  try {
    if (!req.body.ID_Toanha || !req.body.Tenkhuvuc) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
    }
    const userData = req.user.data;

    if (userData) {
      const ID_User = userData.ID_User;
      const data = {
        ID_Toanha: req.body.ID_Toanha,
        ID_KhoiCV: req.body.ID_KhoiCVs
          ? req.body.ID_KhoiCVs[0]
          : req.body.ID_KhoiCV || null,
        ID_KhoiCVs: req.body.ID_KhoiCVs
          ? req.body.ID_KhoiCVs
          : [req.body.ID_KhoiCV] || null,
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
      if (userData?.ID_KhoiCV !== null && userData?.ID_KhoiCV !== undefined) {
        whereCondition[Op.or] = [
          { ID_KhoiCV: userData?.ID_KhoiCV },
          { $ID_KhoiCVs$: { [Op.contains]: [userData?.ID_KhoiCV] } },
        ];
      }

      await Ent_khuvuc.findAll({
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "ID_KhoiCVs",
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
        order: [["ID_Toanha", "ASC"]],
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
          "ID_KhoiCVs",
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
        ID_KhoiCV: req.body.ID_KhoiCVs[0] || null,
        ID_KhoiCVs: req.body.ID_KhoiCVs || null,
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
            "ID_KhoiCVs",
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
      // Initialize where condition
      const whereCondition = {
        isDelete: 0, // Always include isDelete condition
        [Op.and]: [],
      };

      if (userData.Permission !== 3 && userData.UserName !== "PSH") {
        // Add ID_Duan condition if it exists
        if (userData.ID_Duan !== null) {
          whereCondition["$ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }

        // Add ID_KhoiCV condition if it exists
        if (userData.ID_KhoiCV !== null && userData.ID_KhoiCV !== undefined) {
          whereCondition[Op.and].push(
            Sequelize.literal(
              `JSON_CONTAINS(ID_KhoiCVs, '${userData.ID_KhoiCV}')`
            )
          );

          // whereCondition[Op.and].push({
          //   ID_KhoiCV: userData.ID_KhoiCV,
          // });

          // Replace Op.contains with Op.like for MySQL (adjust according to your DB)
        }

        // Add ID_Toanha condition if it exists in request body
        if (req.body.ID_Toanha !== null && req.body.ID_Toanha !== undefined) {
          whereCondition[Op.and].push({
            ID_Toanha: req.body.ID_Toanha,
          });
        }
      }
      // Fetch data
      Ent_khuvuc.findAll({
        attributes: [
          "ID_Khuvuc",
          "ID_Toanha",
          "ID_KhoiCV",
          "ID_KhoiCVs",
          "Sothutu",
          "Makhuvuc",
          "MaQrCode",
          "Tenkhuvuc",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_hangmuc,
            as: "ent_hangmuc",
            attributes: ["ID_Hangmuc", "ID_Khuvuc", "Hangmuc", "MaQrCode", "isDelete", "Tieuchuankt", "ID_KhoiCV", "FileTieuChuan"],
            where: { isDelete: 0 },
            required: false,
          },
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
        order: [["ID_Toanha", "ASC"]],
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
      res.status(400).json({
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
          "ID_KhoiCVs",
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
            data: data ? [data] : [],
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

exports.getKhuvucTotal = async (req, res) => {
  try {
    const userData = req.user.data;
    if (!userData) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    let whereCondition = {
      isDelete: 0,
    };

    whereCondition["$ent_toanha.ID_Duan$"] = userData?.ID_Duan;

    const khuvucData = await Ent_khuvuc.findAll({
      attributes: [
        "Tenkhuvuc",
        "MaQrCode",
        "Makhuvuc",
        "Sothutu",
        "ID_Toanha",
        "ID_KhoiCV",
        "ID_KhoiCVs",
        "ID_Khuvuc",
      ],
      include: [
        {
          model: Ent_toanha,
          attributes: ["Toanha", "Sotang", "ID_Toanha"],
          include: {
            model: Ent_duan,
            attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo", "Logo"],
          },
        },
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV"],
        },
      ],
      where: whereCondition,
    });

    if (!khuvucData || khuvucData.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }
    const khoiCVData = [
      { ID_Khoi: 2, KhoiCV: "Khối kỹ thuật" },
      { ID_Khoi: 1, KhoiCV: "Khối làm sạch" },
      { ID_Khoi: 3, KhoiCV: "Khối bảo vệ" },
      { ID_Khoi: 4, KhoiCV: "Khối dịch vụ" },
    ];

    // Create a map for quick lookup of KhoiCV by ID_Khoi
    const khoiCVMap = {};
    khoiCVData.forEach((item) => {
      khoiCVMap[item.ID_Khoi] = item.KhoiCV;
    });

    // Group and count by individual ID_KhoiCVs values
    const khuvucCounts = {};
    khuvucData.forEach((item) => {
      let ID_KhoiCVs = item.ID_KhoiCVs;
      // Assuming ID_KhoiCVs is already an array
      if (typeof ID_KhoiCVs === 'string') {
        try {
          ID_KhoiCVs = JSON.parse(ID_KhoiCVs);
        } catch (error) {
          return;
        }
      } 

      ID_KhoiCVs.forEach((id) => {
        const khoiCV = khoiCVMap[id];
        if (!khuvucCounts[khoiCV]) {
          khuvucCounts[khoiCV] = 0;
        }
        khuvucCounts[khoiCV]++;
      });
    });

    console.log('khuvucCounts',khuvucCounts)

    // Convert counts to desired format
    const result = Object.keys(khuvucCounts).map((khoiCV) => ({
      label: khoiCV,
      value: khuvucCounts[khoiCV],
    }));

    return res.status(200).json({
      message: "Danh sách khu vực!",
      length: result.length,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.deleteMul = async (req, res)=> {
  try {
    const userData = req.user.data;
    const deleteRows = req.body;
    const idsToDelete = deleteRows.map(row => row.ID_Khuvuc);
    if (userData) {
      Ent_khuvuc.update(
        { isDelete: 1 },
        {
          where: {
            ID_Khuvuc: idsToDelete,
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
  }catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
}

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const userData = req.user.data;

    // Read the uploaded Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    // Extract data from the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const commonDetailsMap = {};

    data.forEach((item) => {
      const maChecklist = item["Mã checklist"];
      if (!commonDetailsMap[maChecklist]) {
        commonDetailsMap[maChecklist] = {
          "Tên dự án": item["Tên dự án"],
          "Tên tòa nhà": item["Tên tòa nhà"],
          "Mã khu vực": item["Mã khu vực"],
          "Mã QrCode khu vực": item["Mã QrCode khu vực"],
          "Tên khu vực": item["Tên khu vực"],
          "Mã QrCode hạng mục": item["Mã QrCode hạng mục"],
          "Tên Hạng Mục": item["Tên Hạng Mục"],
          "Tên tầng": item["Tên tầng"],
          "Tên khối công việc": item["Tên khối công việc"],
        };
      }
    });

    // Step 2: Update objects with common details
    const updatedData = data.map((item) => {
      // const maChecklist = item["Mã checklist"];
      return {
        ...item,
        // ...commonDetailsMap[maChecklist],
      };
    });

    await sequelize.transaction(async (transaction) => {
      const removeSpacesFromKeys = (obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const newKey = key?.replace(/\s+/g, "")?.toUpperCase();
          acc[newKey] = obj[key];
          return acc;
        }, {});
      };

      for (const item of updatedData) {
        const transformedItem = removeSpacesFromKeys(item);

        const tenKhoiCongViec = transformedItem["TÊNKHỐICÔNGVIỆC"];
        const tenToanha = transformedItem["TÊNTÒANHÀ"];
        const tenKhuvuc = transformedItem["TÊNKHUVỰC"];
        const maKhuvuc = transformedItem["MÃKHUVỰC"];
        const maQrKhuvuc = transformedItem["MÃQRCODEKHUVỰC"];

        const sanitizedTenToanha = tenToanha?.replace(/\t/g, ''); // Loại bỏ tất cả các ký tự tab

        const toaNha = await Ent_toanha.findOne({
          attributes: ["ID_Toanha", "Sotang", "Toanha", "ID_Duan"],
          where: {
            Toanha: sanitizedTenToanha,
            ID_Duan: userData.ID_Duan
            
          },
          transaction,
        });
        
        const khoiCV = await Ent_khoicv.findOne({
          attributes: ["ID_Khoi", "KhoiCV"],
          where: {
            KhoiCV: sequelize.where(
              sequelize.fn("UPPER", sequelize.col("KhoiCV")),
              "LIKE",
              "%" + tenKhoiCongViec.toUpperCase() + "%"
            ),
          },
          transaction,
        });

        // Check if tenKhuvuc already exists in the database
        const existingKhuVuc = await Ent_khuvuc.findOne({
          attributes: ["ID_KhuVuc", "Tenkhuvuc", "isDelete", "ID_Toanha", "ID_User"],
          where: {
            [Op.and]: [
              where(fn("UPPER", col("Tenkhuvuc")), {
                [Op.like]: `%${tenKhuvuc}%`,
              }),
              where(fn("UPPER", col("MaQrCode")), {
                [Op.like]: `%${maQrKhuvuc}%`,
              }),
            ],
            ID_Toanha: toaNha.ID_Toanha,
            isDelete: 0,
            ID_User: userData.ID_User
          },
          transaction,
        });

        if (!existingKhuVuc) {
          // If tenKhuvuc doesn't exist, create a new entry
          const dataInsert = {
            ID_Toanha: toaNha.ID_Toanha,
            ID_KhoiCV: khoiCV.ID_Khoi,
            ID_KhoiCVs: [khoiCV.ID_Khoi],
            Sothutu: 1,
            Makhuvuc: maKhuvuc,
            MaQrCode: maQrKhuvuc,
            Tenkhuvuc: tenKhuvuc,
            ID_User: userData.ID_User,
            isDelete: 0,
          };

          await Ent_khuvuc.create(dataInsert, { transaction });
        } else {
          console.log(
            `Khu vực "${tenKhuvuc}" đã tồn tại, bỏ qua việc tạo mới.`
          );
        }
      }
    });

    res.send({
      message: "File uploaded and data processed successfully",
      data,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

function capitalizeEachWord(str) {
  return str.toLowerCase().replace(/\b\w/g, function (match) {
    return match.toUpperCase();
  });
}
