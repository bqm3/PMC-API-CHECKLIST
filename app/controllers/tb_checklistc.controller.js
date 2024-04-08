const moment = require("moment");
const {
  Ent_duan,
  Ent_calv,
  Ent_giamsat,
  Ent_khoicv,
  Tb_checklistc,
  Ent_chucvu,
} = require("../models/setup.model");
const { Op } = require("sequelize");
const { uploadFile } = require("../middleware/auth_google");
const Ent_checklistc = require("../models/tb_checklistc.model");

exports.createFirstChecklist = async (req, res, next) => {
  try {
    const userData = req.user.data;
    // Validate request
    if (!req.body.ID_Calv || !req.body.ID_Giamsat) {
      res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }

    const formattedDate = moment(req.body.Ngay)
      .startOf("day")
      .format("YYYY-MM-DD");
    const { ID_Giamsat, ID_Calv, ID_KhoiCV } = req.body;

    // Kiểm tra sự tồn tại của Ngay, ID_Giamsat, ID_KhoiCV trong cơ sở dữ liệu
    Tb_checklistc.findAndCountAll({
      attributes: [
        "ID_ChecklistC",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_Calv",
        "ID_Giamsat",
        "Ngay",
        "Tinhtrang",
      ],
      where: {
        [Op.and]: [
          { Ngay: req.body.Ngay },
          { ID_KhoiCV: ID_KhoiCV },
        ],
      },
    })
      .then(({ count, rows }) => {

        // Kiểm tra xem đã có checklist được tạo hay chưa
        if (count === 0) {
          // Nếu không có checklist tồn tại, tạo mới
          const data = {
            ID_Giamsat: req.body.ID_Giamsat,
            ID_Calv: req.body.ID_Calv,
            ID_Duan: req.body.ID_Duan,
            ID_KhoiCV: req.body.ID_KhoiCV,
            Giobd: req.body.Giobd,
            Ngay: formattedDate,
            Tinhtrang: 0,
            isDelete: 0,
          };

          Tb_checklistc.create(data)
            .then((data) => {
              res.status(201).json({
                message: "Tạo checklist thành công!",
                data: data,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: err.message || "Lỗi! Vui lòng thử lại sau.",
              });
            });
        } else {
          // Nếu đã có checklist được tạo
          // Kiểm tra xem tất cả các ca checklist đều đã hoàn thành (Tinhtrang === 1)
          const allCompleted = rows.every(
            (checklist) => checklist.dataValues.Tinhtrang === 1
          );
          //
          if (allCompleted) {
            // Nếu tất cả các ca checklist đều đã hoàn thành (Tinhtrang === 1), cho phép tạo mới
            const data = {
              ID_Giamsat: req.body.ID_Giamsat,
              ID_Calv: req.body.ID_Calv,
              ID_Duan: req.body.ID_Duan,
              ID_KhoiCV: req.body.ID_KhoiCV,
              Giobd: req.body.Giobd,
              Ngay: formattedDate,
              Tinhtrang: 0,
              isDelete: 0,
            };

            Tb_checklistc.create(data)
              .then((data) => {
                res.status(201).json({
                  message: "Tạo checklist thành công!",
                  data: data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  message: err.message || "Lỗi! Vui lòng thử lại sau.",
                });
              });
          } else {
            // Nếu có ít nhất một ca checklist chưa hoàn thành (Tinhtrang !== 1), không cho tạo mới
            res.status(400).json({
              message: "Có ít nhất một ca checklist chưa hoàn thành",
              data: rows,
            });
          }
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.createCheckList = async (req, res, next) => {
  try {
    if (
      !req.body.Ngay ||
      !req.body.ID_Calv ||
      !req.body.ID_Giamsat ||
      !req.body.Giobd
    ) {
      res.status(400).json({
        message: "Phải nhập đủ các trường thông tin!!!",
      });
      return;
    }
    let pictureFiles = req.files;
    const uploadPromises = pictureFiles.map((image) => {
      return image;
    });

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);
    // Extract URLs from Cloudinary upload results
    const imageURLs = results.map((result) => result.path);

    const data = {
      ID_Duan: req.body.ID_Duan,
      ID_KhoiCV: req.body.ID_KhoiCV,
      Ngay: req.body.Ngay,
      ID_Calv: req.body.ID_Calv,
      ID_Giamsat: req.body.ID_Giamsat,
      Giobd: req.body.Giobd,
      Giochupanh1: req.body.Giochupanh1,
      Anh1: imageURLs[0] ? imageURLs[0] : "",
      Giochupanh2: req.body.Giochupanh2,
      Anh2: imageURLs[1] ? imageURLs[1] : "",
      Giochupanh3: req.body.Giochupanh3,
      Anh3: imageURLs[2] ? imageURLs[2] : "",
      Giochupanh4: req.body.Giochupanh4,
      Anh4: imageURLs[3] ? imageURLs[3] : "",
      Giokt: req.body.Giokt,
      Ghichu: req.body.Ghichu || "",
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
        res.status(500).json({
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
            attributes: ["ID_Duan", "Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi", "KhoiCV"],
          },
          {
            model: Ent_calv,
            attributes: ["ID_Calv", "Tenca", "Giobatdau", "Gioketthuc"],
          },
          {
            model: Ent_giamsat,
            attributes: ["ID_Giamsat", "Hoten"],
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
        order: [["Ngay", "DESC"]],
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
            attributes: ["ID_Duan", "Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi", "KhoiCV"],
          },
          {
            model: Ent_calv,
            attributes: ["ID_Calv", "Tenca", "Giobatdau", "Gioketthuc"],
          },
          {
            model: Ent_giamsat,
            attributes: ["ID_Giamsat", "Hoten"],
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

exports.close = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Tb_checklistc.update(
        { Tinhtrang: 1, Giokt: req.body.Giokt },
        {
          where: {
            ID_ChecklistC: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(201).json({
            message: "Khóa ca thành công!",
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

exports.checklistImages = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Checklist = req.params.id;
    if (userData && ID_Checklist) {
      let images = req.files;

      const uploadedFileIds = [];

      for (let f = 0; f < images.length; f += 1) {
        const fileId = await uploadFile(images[f]); // Upload file and get its id
        uploadedFileIds.push(fileId); // Push id to array
      }

      const reqData = {};

      // Populate reqData with available image data
      for (let i = 1; i <= 4; i++) {
        const imageKey = `Anh${i}`;
        const timestampKey = `Giochupanh${i}`;
        if (req.body[imageKey]) {
          const imagePath = uploadedFileIds.find(
            (file) => file.name === req.body[imageKey]
          )?.id;
          //  ;
          if (imagePath) {
            reqData[imageKey] = imagePath;
            reqData[timestampKey] = req.body[timestampKey] || "";
          }
        }
      }

      // Perform update only if reqData contains any data
      if (Object.keys(reqData).length > 0) {
        await Ent_checklistc.update(reqData, {
          where: { ID_ChecklistC: ID_Checklist },
        });

        res.status(201).json({ message: "Cập nhật khu vực thành công!" });
      } else {
        res
          .status(400)
          .json({ message: "Không có dữ liệu hình ảnh hợp lệ để cập nhật!" });
      }
    } else {
      res
        .status(401)
        .json({ message: "Bạn không có quyền truy cập! Vui lòng thử lại" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};
