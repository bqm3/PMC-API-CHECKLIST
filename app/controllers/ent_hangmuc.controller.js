const {
  Ent_hangmuc,
  Ent_toanha,
  Ent_khoicv,
  Ent_chucvu,
  Ent_user,
  Ent_duan,
} = require("../models/setup.model");
const { Ent_khuvuc } = require("../models/setup.model");
const { Op, Sequelize,fn, col, literal, where  } = require("sequelize");
const sequelize = require("../config/db.config");
const xlsx = require("xlsx");


// Create and Save a new Ent_tang
exports.create = async (req, res, next) => {
  // Validate request
  try {
    if (!req.body.Hangmuc || !req.body.Tieuchuankt) {
      res.status(400).json({
        message: "Cần nhập đầy đủ thông tin!",
      });
      return;
    }
    const MaQrCode = req.body.MaQrCode;

    const userData = req.user.data;
    if (userData) {
      const existingHangMuc = await Ent_hangmuc.findOne({
        where: {
          MaQrCode: MaQrCode,
          isDelete: 0,
        },
        attributes: ["ID_Hangmuc", "MaQrCode", "isDelete"],
      });

      // Kiểm tra QR code trong Ent_khuvuc
      const existingKhuVuc = await Ent_khuvuc.findOne({
        attributes: ["ID_Khuvuc", "MaQrCode", "isDelete"],
        where: {
          MaQrCode: MaQrCode,
          isDelete: 0,
        },
      });

      if (existingHangMuc || existingKhuVuc) {
        // QR code đã tồn tại trong một trong hai bảng
        return res.status(500).json({
          message: "QR code trùng lặp, không thể thêm mới.",
        });
      } else {
        // QR code không trùng lặp, cho phép thêm mới
        const data = {
          ID_Khuvuc: req.body.ID_Khuvuc,
          ID_KhoiCV: req.body.ID_KhoiCV,
          MaQrCode: req.body.MaQrCode || null,
          Hangmuc: req.body.Hangmuc || null,
          Tieuchuankt: req.body.Tieuchuankt || null,
          isDelete: 0,
        };

        Ent_hangmuc.create(data)
          .then((data) => {
            res.status(200).json({
              message: "Tạo hạng mục thành công!",
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
      return res.status(500).json({
        message: "Bạn không có quyền tạo hạng mục.",
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
    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_khuvuc.ent_toanha.ID_Duan$": userData?.ID_Duan,
      });
      if (userData.ID_KhoiCV !== null && userData.ID_KhoiCV !== undefined) {
        orConditions.push({
          ID_KhoiCV: userData.ID_KhoiCV,
        });
      }
      await Ent_hangmuc.findAll({
        attributes: [
          "ID_Hangmuc",
          "ID_Khuvuc",
          "ID_KhoiCV",
          "MaQrCode",
          "Hangmuc",
          "Tieuchuankt",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV", "ID_Khoi"],
            where: {
              isDelete: 0,
            },
          },
          {
            model: Ent_khuvuc,
            attributes: [
              "ID_Toanha",
              "ID_Khuvuc",
              "ID_KhoiCV",
              "ID_KhoiCVs",
              "Sothutu",
              "MaQrCode",
              "Tenkhuvuc",
              "ID_User",
              "isDelete",
            ],
            where: {
              isDelete: 0,
            },
            include: [
              {
                model: Ent_toanha,
                attributes: [
                  "ID_Toanha",
                  "ID_Duan",
                  "Toanha",
                  "Sotang",
                  "isDelete",
                ],
                where: {
                  isDelete: 0,
                },
              },
            ],
          },
         
        ],
        where: {
          isDelete: 0,
          [Op.and]: [orConditions],
        },
        order: [["ID_Khuvuc", "ASC"]],
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách hạng mục!!!",
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
    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_khuvuc.ent_toanha.ID_Duan$": userData?.ID_Duan,
      });
      if (userData.ID_KhoiCV !== null) {
        orConditions.push({
          $ID_KhoiCV$: userData.ID_KhoiCV,
        });
      }
      await Ent_hangmuc.findByPk(req.params.id, {
        attributes: [
          "ID_Hangmuc",
          "ID_Khuvuc",
          "MaQrCode",
          "ID_KhoiCV",
          "Hangmuc",
          "Tieuchuankt",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
            attributes: [
              "ID_Toanha",
              "ID_Khuvuc",
              "ID_KhoiCV",
              "ID_KhoiCVs",
              "Sothutu",
              "MaQrCode",
              "Tenkhuvuc",
              "ID_User",
              "isDelete",
            ],
            where: {
              isDelete: 0,
            },
            include: [
              {
                model: Ent_toanha,
                attributes: [
                  "ID_Toanha",
                  "ID_Duan",
                  "Toanha",
                  "Sotang",
                  "isDelete",
                ],
                where: {
                  isDelete: 0,
                },
              },
            ],
          },
        ],
        where: {
          isDelete: 0,
          [Op.and]: [orConditions],
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Hạng mục cần tìm!",
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
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_KhoiCV: req.body.ID_KhoiCV,
        MaQrCode: req.body.MaQrCode,
        Hangmuc: req.body.Hangmuc,
        Tieuchuankt: req.body.Tieuchuankt,
        isDelete: 0,
      };

      // Kiểm tra xem mã QR Code mới có trùng với bất kỳ bản ghi nào khác trong cơ sở dữ liệu không
      const existingHangMuc = await Ent_hangmuc.findOne({
        where: {
          MaQrCode: req.body.MaQrCode,
          ID_Hangmuc: { [Op.ne]: req.params.id },
          isDelete: 0,
        },
        attributes: ["MaQrCode", "ID_Hangmuc"],
      });

      const existingKhuVuc = await Ent_khuvuc.findOne({
        attributes: ["ID_Khuvuc", "MaQrCode", "isDelete"],
        where: {
          MaQrCode: req.body.MaQrCode,
          isDelete: 0,
        },
      });

      if (existingHangMuc || existingKhuVuc) {
        res.status(400).json({
          message: "Mã QR Code đã tồn tại!",
        });
        return;
      }

      Ent_hangmuc.update(reqData, {
        where: {
          ID_Hangmuc: req.params.id,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Cập nhật hạng mục thành công!",
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
      Ent_hangmuc.update(
        { isDelete: 1 },
        {
          where: {
            ID_Hangmuc: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa hạng mục thành công!",
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

exports.filterByKhuvuc = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Khuvuc = req.params.id;

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
          whereCondition["$ent_khuvuc.ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }
        if (userData.ID_KhoiCV !== null) {
          whereCondition["$ID_KhoiCV$"] = userData.ID_KhoiCV;
        }
        if (
          ID_Khuvuc !== null &&
          ID_Khuvuc !== undefined &&
          ID_Khuvuc !== "" &&
          ID_Khuvuc !== "null"
        ) {
          whereCondition[Op.and].push({
            ID_Khuvuc: ID_Khuvuc,
          });
        }
      }
      // Thêm điều kiện isDelete
      whereCondition.isDelete = 0;
      Ent_hangmuc.findAll({
        attributes: [
          "ID_Hangmuc",
          "ID_Khuvuc",
          "MaQrCode",
          "Hangmuc",
          "Tieuchuankt",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
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
          },
        ],
        where: whereCondition,
        order: [["ID_Khuvuc", "ASC"]],
      })
        .then((data) => {
          res.status(200).json({
            message: "Thông tin hạng mục!",
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
          whereCondition["$ent_khuvuc.ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }
        if (userData.ID_KhoiCV !== null) {
          whereCondition["$ent_khuvuc.ID_KhoiCV$"] = userData.ID_KhoiCV;
        }
      }
      // Thêm điều kiện isDelete
      whereCondition.isDelete = 0;
      whereCondition.MaQrCode = req.body.MaQrCode;
      Ent_hangmuc.findOne({
        attributes: [
          "ID_Hangmuc",
          "ID_Khuvuc",
          "MaQrCode",
          "Hangmuc",
          "Tieuchuankt",
          "isDelete",
        ],
        include: [
          {
            model: Ent_khuvuc,
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
          },
        ],
        where: whereCondition,
      })
        .then((data) => {
          res.status(200).json({
            message: "Thông tin hạng mục!",
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

exports.getHangmucTotal = async (req, res) => {
  try {
    const userData = req.user.data;
    if (!userData || !userData.ID_Duan) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    let whereCondition = {
      isDelete: 0,
      "$ent_khuvuc.ent_toanha.ID_Duan$": userData?.ID_Duan,
    };

    const hangmucData = await Ent_hangmuc.findAll({
      attributes: [
        "ID_Hangmuc",
        "ID_Khuvuc",
        "MaQrCode",
        "Hangmuc",
        "Tieuchuankt",
        "isDelete",
      ],
      include: [
        {
          model: Ent_khuvuc,
          attributes: [
            "ID_Toanha",
            "ID_Khuvuc",
            "ID_KhoiCV",
            "Sothutu",
            "MaQrCode",
            "Tenkhuvuc",
            "ID_User",
            "isDelete",
          ],

          include: [
            {
              model: Ent_toanha,
              attributes: [
                "ID_Toanha",
                "ID_Duan",
                "Toanha",
                "Sotang",
                "isDelete",
              ],
            },
            {
              model: Ent_khoicv,
              attributes: ["KhoiCV"],
            },
          ],
        },
      ],
      where: whereCondition,
    });

    if (!hangmucData || hangmucData.length === 0) {
      return res.status(200).json({
        message: "Không có hạng mục!",
        data: [],
      });
    }

    // Count checklists by ID_KhoiCV
    const hangmucCounts = {};
    hangmucData.forEach((item) => {
      const khoiCV = item.ent_khuvuc?.ent_khoicv?.KhoiCV;
      if (khoiCV) {
        if (!hangmucCounts[khoiCV]) {
          hangmucCounts[khoiCV] = 0;
        }
        hangmucCounts[khoiCV]++;
      }
    });
    // Convert counts to desired format
    const result = Object.keys(hangmucCounts).map((khoiCV) => ({
      label: khoiCV,
      value: hangmucCounts[khoiCV],
    }));

    return res.status(200).json({
      message: "Danh sách hạng mục!",
      length: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Error in getHangmucTotal:", err);
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};


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
      return {
        ...item,
      };
    });


    await sequelize.transaction(async (transaction) => {
      for (const item of updatedData) {
        const tenKhoiCongViec = item["Tên khối công việc"];
        const tenKhuvuc = item["Tên khu vực"];
        const maKhuvuc = item["Mã khu vực"];
        const maQrKhuvuc = item["Mã QrCode khu vực"];
        const maQrHangmuc = item["Mã QrCode hạng mục"];
        const tenHangmuc = item["Tên Hạng Mục"];
        const tenTang = item["Tên tầng"];

        const khuVuc = await Ent_khuvuc.findOne({
          attributes: [
            "ID_Khuvuc",
            "MaQrCode",
            "Tenkhuvuc",
          ],
          where: {
            MaQrCode: sequelize.where(
              sequelize.fn("UPPER", sequelize.col("MaQrCode")),
              "LIKE",
              "%" + maQrKhuvuc.toUpperCase() + "%"
            ),
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
            )
          },
          transaction,
        });

        // Check if tenKhuvuc already exists in the database
        const existingHangMuc = await Ent_hangmuc.findOne({
          attributes: ["ID_Hangmuc", "Hangmuc", "MaQrCode"],
          where: {
            [Op.and]: [
              where(fn("UPPER", col("Hangmuc")), { [Op.like]: `%${tenHangmuc}%` }),
              where(fn("UPPER", col("MaQrCode")), { [Op.like]: `%${maQrHangmuc}%` })
            ]
        },
          transaction,
        });

        

        if (!existingHangMuc) {
          // If tenKhuvuc doesn't exist, create a new entry
          const dataInsert = {
            ID_Khuvuc: khuVuc.ID_Khuvuc,
            ID_KhoiCV: khoiCV.ID_Khoi,
            MaQrCode: maQrHangmuc,
            Hangmuc: tenHangmuc,
            isDelete: 0
          };

          await Ent_hangmuc.create(dataInsert, { transaction });
        } else {
          console.log(`Hang muc "${tenHangmuc}" đã tồn tại, bỏ qua việc tạo mới.`);
        }
      }
    });

    res.send({
      message: "File uploaded and data processed successfully",
      data,
    });
  } catch (err) {
    console.log('err', err)
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};