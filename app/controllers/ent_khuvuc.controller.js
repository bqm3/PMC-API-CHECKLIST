const {
  Ent_toanha,
  Ent_khuvuc,
  Ent_khoicv,
  Ent_duan,
} = require("../models/setup.model");
const { Op, Sequelize  } = require("sequelize");
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
        ID_KhoiCV: JSON.stringify(req.body.ID_KhoiCVs[0]) || null,
        ID_KhoiCVs: JSON.stringify(req.body.ID_KhoiCVs),
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
          { '$ID_KhoiCVs$': { [Op.contains]: [userData?.ID_KhoiCV] } }
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
        ID_KhoiCV: JSON.stringify(req.body.ID_KhoiCVs[0]) || null,
        ID_KhoiCVs: JSON.stringify(req.body.ID_KhoiCVs) || null,
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
        [Op.and]: []
      };

      if (userData.Permission !== 3 && userData.UserName !== "PSH") {
        // Add ID_Duan condition if it exists
        if (userData.ID_Duan !== null) {
          whereCondition["$ent_toanha.ID_Duan$"] = userData.ID_Duan;
        }

        // Add ID_KhoiCV condition if it exists
        if (userData.ID_KhoiCV !== null && userData.ID_KhoiCV !== undefined) {

          whereCondition[Op.and].push(
            Sequelize.literal(`JSON_CONTAINS(ID_KhoiCVs, '${userData.ID_KhoiCV}')`)
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

      // Debugging: log the where condition to verify
      console.log("whereCondition:", whereCondition);

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
            model: Ent_toanha,
            attributes: ["Toanha", "Sotang", "ID_Toanha"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
        ],
        where: whereCondition,
        order: [
          ["ID_Toanha", "ASC"],
        ],
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

    // Filter data

    const khuvucCounts = {};
    khuvucData.forEach((item) => {
      const khoiCV = item.ent_khoicv.KhoiCV;
      if (!khuvucCounts[khoiCV]) {
        khuvucCounts[khoiCV] = 0;
      }
      khuvucCounts[khoiCV]++;
    });

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
      const maChecklist = item["Mã checklist"];
      return {
        ...item,
        ...commonDetailsMap[maChecklist],
      };
    });

    console.log('updatedData', updatedData)

    // await sequelize.transaction(async (transaction) => {
    //   for (const item of updatedData) {
    //     const maQrCodeHangMuc = item["Mã QrCode hạng mục"];
    //     const tenTang = item["Tên tầng"];
    //     const tenKhoiCongViec = item["Tên khối công việc"];
    //     const caChecklist = item["Ca checklist"];
    //     const maChecklist = item["Mã checklist"];
    //     const qrChecklist = item["Mã QrCode checklist"];
    //     const tenChecklist = item["Tên checklist"];
    //     const tieuChuanChecklist = item["Tiêu chuẩn checklist"];
    //     const giaTriDanhDinh = item["Giá trị danh định"];
    //     const cacGiaTriNhan = item["Các giá trị nhận"];
    //     const ghiChu = item["Ghi chú"];

    //     const hangmuc = await Ent_hangmuc.findOne({
    //       attributes: [
    //         "Hangmuc",
    //         "Tieuchuankt",
    //         "ID_Khuvuc",
    //         "MaQrCode",
    //         "ID_Hangmuc",
    //       ],
    //       where: { MaQrCode: maQrCodeHangMuc },
    //       transaction,
    //     });

    //     const tang = await Ent_tang.findOne({
    //       attributes: ["Tentang", "Sotang", "ID_Tang", "ID_Duan"],
    //       where: {
    //         Tentang: sequelize.where(
    //           sequelize.fn("UPPER", sequelize.col("Tentang")),
    //           "LIKE",
    //           "%" + tenTang.toUpperCase() + "%"
    //         ),
    //         ID_Duan: userData.ID_Duan,
    //       },
    //       transaction,
    //     });

    //     const khoiCV = await Ent_khoicv.findOne({
    //       attributes: ["ID_Khoi", "KhoiCV"],
    //       where: { KhoiCV: tenKhoiCongViec },
    //       transaction,
    //     });

    //     const caChecklistArray = caChecklist.split(",").map((ca) => ca.trim());
    //     const calv = await Ent_calv.findAll({
    //       attributes: ["ID_Calv", "ID_Duan", "ID_KhoiCV", "Tenca"],
    //       where: {
    //         TenCa: caChecklistArray,
    //         ID_Duan: userData.ID_Duan,
    //         ID_KhoiCV: khoiCV.ID_Khoi,
    //       },
    //       transaction,
    //     });
    //     const sCalv = calv.map((calvItem) => calvItem.ID_Calv);

    //     const data = {
    //       ID_Khuvuc: hangmuc.ID_Khuvuc,
    //       ID_Tang: tang.ID_Tang,
    //       ID_Hangmuc: hangmuc.ID_Hangmuc,
    //       Sothutu: 1,
    //       Maso: maChecklist || "",
    //       MaQrCode: qrChecklist || "",
    //       Checklist: tenChecklist,
    //       Ghichu: ghiChu || "",
    //       Tieuchuan: tieuChuanChecklist || "",
    //       Giatridinhdanh: capitalizeEachWord(giaTriDanhDinh) || "",
    //       Giatrinhan: capitalizeEachWord(cacGiaTriNhan) || "",
    //       ID_User: userData.ID_User,
    //       sCalv: JSON.stringify(sCalv) || null,
    //       calv_1: JSON.stringify(sCalv[0]) || null,
    //       calv_2: JSON.stringify(sCalv[1]) || null,
    //       calv_3: JSON.stringify(sCalv[2]) || null,
    //       calv_4: JSON.stringify(sCalv[3]) || null,
    //       isDelete: 0,
    //       Tinhtrang: 0,
    //     };

    //     await Ent_checklist.create(data, { transaction });
    //   }
    // });

    // res.send({
    //   message: "File uploaded and data extracted successfully",
    //   data,
    // });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};


function capitalizeEachWord(str) {
  return str.toLowerCase().replace(/\b\w/g, function(match) {
      return match.toUpperCase();
  });
}