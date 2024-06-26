const moment = require("moment");
const {
  Ent_duan,
  Ent_calv,
  Ent_giamsat,
  Ent_khoicv,
  Tb_checklistc,
  Ent_chucvu,
  Ent_checklist,
  Ent_khuvuc,
  Ent_hangmuc,
  Ent_user,
  Ent_toanha,
  Tb_checklistchitiet,
  Tb_checklistchitietdone,
  Ent_tang,
} = require("../models/setup.model");
const { Op, Sequelize } = require("sequelize");
const { uploadFile } = require("../middleware/auth_google");
const Ent_checklistc = require("../models/tb_checklistc.model");
const sequelize = require("../config/db.config");
const cron = require("node-cron");

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
    const { ID_Giamsat, ID_Calv, ID_KhoiCV, ID_User, ID_Duan, Ngay, Giobd } =
      req.body;

    const calvData = await Ent_calv.findOne({
      where: { ID_Calv: ID_Calv },
      attributes: ["Giobatdau", "Gioketthuc"],
    });

    const user = await Ent_user.findByPk(userData.ID_User, {
      attributes: [
        "ID_User",
        "UserName",
        "Emails",
        "Password",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_Khuvucs",
        "Permission",
        "isDelete",
      ],
    });

    if (!calvData) {
      return res.status(400).json({
        message: "Ca làm việc không tồn tại!",
      });
    }

    const { Giobatdau, Gioketthuc } = calvData;

    const giobdMoment = moment(Giobd, "HH:mm:ss");
    const giobatdauMoment = moment(Giobatdau, "HH:mm:ss");
    const gioketthucMoment = moment(Gioketthuc, "HH:mm:ss");

    if (gioketthucMoment.isBefore(giobatdauMoment)) {
      // Kiểm tra nếu giobdMoment nằm trong khoảng từ giobatdauMoment đến 23:59:59
      // hoặc từ 00:00:00 đến gioketthucMoment
      if (
        !giobdMoment.isBetween(
          giobatdauMoment,
          moment("23:59:59", "HH:mm:ss"),
          null,
          "[]"
        ) &&
        !giobdMoment.isBetween(
          moment("00:00:00", "HH:mm:ss"),
          gioketthucMoment,
          null,
          "[]"
        )
      ) {
        return res.status(400).json({
          message: "Giờ bắt đầu không thuộc khoảng thời gian của ca làm việc!",
        });
      }
    } else {
      // Nếu khoảng thời gian không qua nửa đêm, sử dụng logic thông thường
      if (
        !giobdMoment.isBetween(giobatdauMoment, gioketthucMoment, null, "[]")
      ) {
        return res.status(400).json({
          message: "Giờ bắt đầu không thuộc khoảng thời gian của ca làm việc!",
        });
      }
    }

    let whereConditionChecklist = {
      isDelete: 0,
      [Op.or]: [
        { calv_1: ID_Calv },
        { calv_2: ID_Calv },
        { calv_3: ID_Calv },
        { calv_4: ID_Calv },
      ],
    };

    if (user && user.ID_Khuvucs) {
      whereConditionChecklist["ID_Khuvuc"] = {
        [Op.in]: user?.ID_Khuvucs,
      };
    }

    whereConditionChecklist["$ent_hangmuc.ID_KhoiCV$"] = user?.ID_KhoiCV;

    const checklistData = await Ent_checklist.findAndCountAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Hangmuc",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "ID_User",
        "sCalv",
        "calv_1",
        "calv_2",
        "calv_3",
        "calv_4",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: [
            "Hangmuc",
            "Tieuchuankt",
            "ID_Hangmuc",
            "ID_Khuvuc",
            "ID_KhoiCV",
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
                  attributes: ["Toanha", "Sotang", "ID_Toanha"],
                  include: {
                    model: Ent_duan,
                    attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo"],
                    where: { ID_Duan: userData.ID_Duan },
                  },
                },
              ],
            },
            {
              model: Ent_khoicv,
              attributes: ["ID_Khoi", "KhoiCV"],
            },
          ],
        },
        {
          model: Ent_user,
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: whereConditionChecklist,
      order: [
        ["ID_Khuvuc", "ASC"],
        ["Sothutu", "ASC"],
      ],
    });

    const listKhuvuc = await Ent_toanha.findAll({
      attributes: [
        "ID_Toanha",
        "Toanha",
        "Sotang",
        "ID_Duan",
        "Vido",
        "Kinhdo",
        "isDelete",
      ],
      where: { isDelete: 0 },
      include: [
        {
          model: Ent_khuvuc,
          as: "ent_khuvuc",
          attributes: [
            "ID_Khuvuc",
            "ID_KhoiCV",
            "Makhuvuc",
            "MaQrCode",
            "Tenkhuvuc",
            "isDelete",
          ],
          where: {
            isDelete: 0,
            ID_Khuvuc: {
              [Op.in]: user.ID_Khuvucs,
            },
          },
          required: false,
        },
      ],
      order: [["ID_Toanha", "ASC"]],
    });

    const arrayOfID_Toanha = listKhuvuc
      .filter((toanha) => toanha.ent_khuvuc.length > 0) // Chỉ lấy các tòa nhà có khu vực
      .map((toanha) => toanha.dataValues.ID_Toanha);

    let whereCondition = {
      isDelete: 0,
      ID_User: ID_User,
      [Op.or]: [
        { calv_1: ID_Calv },
        { calv_2: ID_Calv },
        { calv_3: ID_Calv },
        { calv_4: ID_Calv },
      ],
    };

    whereCondition["$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$"] =
      userData?.ID_Duan;
    whereCondition["$ent_hangmuc.ID_KhoiCV$"] = userData?.ID_KhoiCV;

    const toanhaIdsArray = arrayOfID_Toanha.join(",");

    Tb_checklistc.findAndCountAll({
      attributes: [
        "ID_ChecklistC",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_User",
        "ID_Calv",
        "ID_Giamsat",
        "Ngay",
        "Tinhtrang",
      ],
      where: {
        isDelete: 0,
        [Op.and]: [
          { Ngay: Ngay },
          { ID_KhoiCV: ID_KhoiCV },
          { ID_Duan: ID_Duan },
          { ID_User: ID_User },
        ],
      },
    })
      .then(({ count, rows }) => {
        // Kiểm tra xem đã có checklist được tạo hay chưa
        if (count === 0) {
          // Nếu không có checklist tồn tại, tạo mới
          const data = {
            ID_Giamsat: ID_Giamsat,
            ID_User: ID_User,
            ID_Calv: ID_Calv,
            ID_Duan: ID_Duan,
            ID_KhoiCV: ID_KhoiCV,
            Giobd: Giobd,
            Ngay: formattedDate,
            TongC: 0,
            Tong: checklistData.count || 0,
            Tinhtrang: 0,
            ID_Toanha: toanhaIdsArray,
            ID_Khuvucs: user.ID_Khuvucs || null,
            isDelete: 0,
          };

          Tb_checklistc.create(data)
            .then((data) => {
              res.status(200).json({
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
            const allCompletedTwo = rows.every(
              (checklist) => checklist.dataValues.ID_Calv !== ID_Calv
            );

            // Nếu tất cả các ca checklist đều đã hoàn thành (Tinhtrang === 1) va khong phai CALV, cho phép tạo mới
            if (allCompletedTwo) {
              const data = {
                ID_Giamsat: ID_Giamsat,
                ID_User: ID_User,
                ID_Calv: ID_Calv,
                ID_Duan: ID_Duan,
                ID_KhoiCV: ID_KhoiCV,
                Ngay: formattedDate,
                Giobd: Giobd,
                TongC: 0,
                Tong: checklistData.count || 0,
                Tinhtrang: 0,
                ID_Toanha: toanhaIdsArray,
                ID_Khuvucs: user.ID_Khuvucs || null,
                isDelete: 0,
              };

              Tb_checklistc.create(data)
                .then((data) => {
                  res.status(200).json({
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
              res.status(400).json({
                message: "Đã có ca làm việc",
                data: rows,
              });
            }
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

exports.createChecklistInToanha = async (req, res, next) => {
  try {
    const userData = req.user.data;
    const user = await Ent_user.findByPk(userData.ID_User, {
      attributes: [
        "ID_User",
        "UserName",
        "Emails",
        "Password",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_Khuvucs",
        "Permission",
        "isDelete",
      ],
    });
    if (userData) {
      const { ID_ChecklistC, toanhaIds, ID_User, ID_Calv } = req.body;

      const toanhaIdsArray = toanhaIds
        .split(",")
        .map((id) => parseInt(id.trim(), 10));

      let whereCondition = {
        isDelete: 0,
        [Op.or]: [
          { calv_1: ID_Calv },
          { calv_2: ID_Calv },
          { calv_3: ID_Calv },
          { calv_4: ID_Calv },
        ],
      };

      if (user.ID_Khuvucs && user.ID_Khuvucs.length > 0) {
        const khuvucIdsArray = user.ID_Khuvucs.split(",").map((id) =>
          parseInt(id.trim(), 10)
        );
        whereCondition["$ent_hangmuc.ID_Khuvuc$"] = {
          [Op.in]: khuvucIdsArray,
        };
      } else {
        // Nếu ID_Khuvucs không có dữ liệu, lọc theo ID_Toanha
        whereCondition["$ent_hangmuc.ent_khuvuc.ID_Toanha$"] = {
          [Op.in]: toanhaIdsArray,
        };
      }

      whereCondition["$ent_hangmuc.ID_KhoiCV$"] = userData?.ID_KhoiCV;

      const checklistData = await Ent_checklist.findAndCountAll({
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Hangmuc",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Ghichu",
          "Tieuchuan",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "sCalv",
          "calv_1",
          "calv_2",
          "calv_3",
          "calv_4",
          "isDelete",
        ],
        include: [
          {
            model: Ent_hangmuc,
            attributes: [
              "Hangmuc",
              "Tieuchuankt",
              "ID_Hangmuc",
              "ID_Khuvuc",
              "ID_KhoiCV",
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
                    attributes: ["Toanha", "Sotang", "ID_Toanha"],
                    include: {
                      model: Ent_duan,
                      attributes: [
                        "ID_Duan",
                        "Duan",
                        "Diachi",
                        "Vido",
                        "Kinhdo",
                      ],
                      where: { ID_Duan: userData.ID_Duan },
                    },
                  },
                ],
              },
              {
                model: Ent_khoicv,
                attributes: ["ID_Khoi", "KhoiCV"],
              },
            ],
          },
          {
            model: Ent_user,
            include: {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
            attributes: ["UserName", "Emails"],
          },
        ],
        where: whereCondition,
        order: [
          ["ID_Khuvuc", "ASC"],
          ["Sothutu", "ASC"],
        ],
      });

      const reqData = {
        ID_Toanha: toanhaIds,
        TongC: 0,
        Tong: checklistData.count || 0,
      };

      Tb_checklistc.update(reqData, {
        where: {
          ID_ChecklistC: ID_ChecklistC,
        },
      })
        .then(() => {
          res.status(200).json({
            message: "Chọn tòa nhà checklist thành công!",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getCheckListc = async (req, res, next) => {
  try {
    const userData = req.user.data;
    if (userData) {
      let whereClause = {
        ID_Duan: userData?.ID_Duan,
        isDelete: 0,
      };

      // Nếu quyền là 1 (Permission === 1) thì không cần thêm điều kiện ID_KhoiCV
      if (userData.Permission !== 1) {
        whereClause.ID_KhoiCV = userData?.ID_KhoiCV;
      }

      const page = parseInt(req.query.page) || 0;
      const pageSize = parseInt(req.query.limit) || 100; // Số lượng phần tử trên mỗi trang
      const offset = page * pageSize;

      const totalCount = await Tb_checklistc.count({
        attributes: [
          "ID_ChecklistC",
          "ID_Khuvucs",
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
            attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo"],
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
        where: whereClause,
      });
      const totalPages = Math.ceil(totalCount / pageSize);
      await Tb_checklistc.findAll({
        attributes: [
          "ID_ChecklistC",
          "ID_Khuvucs",
          "ID_Duan",
          "ID_KhoiCV",
          "ID_Calv",
          "ID_Toanha",
          "ID_User",
          "ID_Giamsat",
          "Ngay",
          "Tong",
          "TongC",
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
            attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo"],
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
        where: whereClause,
        order: [
          ["Ngay", "DESC"],
          ["ID_ChecklistC", "DESC"],
        ],
        offset: offset,
        limit: pageSize,
      })
        .then((data) => {
          if (data) {
            res.status(200).json({
              message: "Danh sách checklistc!",
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
          "ID_Khuvucs",
          "ID_Duan",
          "ID_KhoiCV",
          "ID_Calv",
          "ID_Toanha",
          "ID_User",
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
            attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo"],
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
            res.status(200).json({
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
          res.status(200).json({
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

exports.open = async (req, res) => {
  try {
    const userData = req.user.data;
    
    if (req.params.id && userData.Permission === 1) {
      // Truy vấn ngày từ cơ sở dữ liệu
      const checklist = await Tb_checklistc.findOne({
        attributes: [
          "ID_ChecklistC",
          "ID_Khuvucs",
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
            attributes: ["ID_Duan", "Duan", "Diachi", "Vido", "Kinhdo"],
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
        where: { ID_ChecklistC: req.params.id }
      });
      
      if (checklist) {
        const currentDay = new Date();
        const checklistDay = new Date(checklist.Ngay); // Giả sử cột ngày trong bảng là 'Ngay'
        
        // So sánh ngày hiện tại và ngày từ cơ sở dữ liệu
        if (currentDay.toDateString() === checklistDay.toDateString()) {
          // Ngày hiện tại bằng với ngày trong cơ sở dữ liệu, cho phép cập nhật
          await Tb_checklistc.update(
            { Tinhtrang: 0 },
            {
              where: { ID_ChecklistC: req.params.id }
            }
          );
          res.status(200).json({
            message: "Mở ca thành công!"
          });
        } else if (currentDay > checklistDay) {
          // Ngày hiện tại lớn hơn ngày từ cơ sở dữ liệu
          res.status(400).json({
            message: "Ngày khóa ca nhỏ hơn ngày hiện tại"
          });
        } else {
          // Ngày hiện tại nhỏ hơn ngày từ cơ sở dữ liệu (nếu có trường hợp này)
          res.status(400).json({
            message: "Không thể mở ca trước ngày đã khóa"
          });
        }
      } else {
        res.status(404).json({
          message: "Không tìm thấy bản ghi"
        });
      }
    } else {
      res.status(400).json({
        message: "Không có quyền chỉnh sửa"
      });
    }

  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau."
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

        res.status(200).json({ message: "Cập nhật khu vực thành công!" });
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

exports.checklistCalv = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      const ID_ChecklistC = req.params.id;
      let whereClause = {
        isDelete: 0,
        ID_ChecklistC: ID_ChecklistC,
      };

      // Fetch checklist detail items
      const dataChecklistChiTiet = await Tb_checklistchitiet.findAll({
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
            where: whereClause,
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
              "ID_Hangmuc",
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
                model: Ent_hangmuc,
                attributes: [
                  "Hangmuc",
                  "Tieuchuankt",
                  "ID_Khuvuc",
                  "MaQrCode",
                  "ID_KhoiCV",
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
                      "ID_KhoiCV",
                      "ID_Khuvuc",
                    ],
                    include: [
                      {
                        model: Ent_toanha,
                        attributes: ["Toanha", "Sotang", "ID_Toanha"],
                        include: {
                          model: Ent_duan,
                          attributes: [
                            "ID_Duan",
                            "Duan",
                            "Diachi",
                            "Vido",
                            "Kinhdo",
                          ],
                          where: { ID_Duan: userData.ID_Duan },
                        },
                      },
                    ],
                  },
                  {
                    model: Ent_khoicv,
                    attributes: ["KhoiCV"],
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
      });

      // Fetch checklist done items
      const checklistDoneItems = await Tb_checklistchitietdone.findAll({
        attributes: ["Description", "isDelete", "ID_ChecklistC"],
        where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
      });

      const arrPush = [];

      // Add status to dataChecklistChiTiet items if length > 0
      if (dataChecklistChiTiet.length > 0) {
        dataChecklistChiTiet.forEach((item) => {
          arrPush.push({ ...item.dataValues, status: 0 });
        });
      }

      // Extract all ID_Checklist from checklistDoneItems and fetch related data
      let checklistIds = [];
      if (checklistDoneItems.length > 0) {
        checklistDoneItems.forEach((item) => {
          const descriptionArray = JSON.parse(item.dataValues.Description);
          if (Array.isArray(descriptionArray)) {
            descriptionArray.forEach((description) => {
              const splitByComma = description.split(",");
              splitByComma.forEach((splitItem) => {
                const [ID_Checklist] = splitItem.split("/");
                checklistIds.push(parseInt(ID_Checklist));
              });
            });
          } else {
            console.log("descriptionArray is not an array.");
          }
        });
      }

      let initialChecklistIds = checklistIds.filter((id) => !isNaN(id));

      // Fetch related checklist data
      const relatedChecklists = await Ent_checklist.findAll({
        attributes: [
          "ID_Checklist",
          "ID_Hangmuc",
          "ID_Tang",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Giatridinhdanh",
          "Giatrinhan",
        ],
        where: {
          ID_Checklist: initialChecklistIds,
        },
        include: [
          {
            model: Ent_hangmuc,
            attributes: [
              "Hangmuc",
              "Tieuchuankt",
              "ID_Khuvuc",
              "MaQrCode",
              "ID_KhoiCV",
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
                  "ID_KhoiCV",
                  "ID_Khuvuc",
                ],
                include: [
                  {
                    model: Ent_toanha,
                    attributes: ["Toanha", "Sotang", "ID_Toanha"],
                    include: {
                      model: Ent_duan,
                      attributes: [
                        "ID_Duan",
                        "Duan",
                        "Diachi",
                        "Vido",
                        "Kinhdo",
                      ],
                      where: { ID_Duan: userData.ID_Duan },
                    },
                  },
                ],
              },
              {
                model: Ent_khoicv,
                attributes: ["KhoiCV"],
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
      });

      // Merge checklistDoneItems data into arrPush
      checklistDoneItems.forEach((item) => {
        const descriptionArray = JSON.parse(item.dataValues.Description);
        if (Array.isArray(descriptionArray)) {
          descriptionArray.forEach((description) => {
            const splitByComma = description.split(",");
            splitByComma.forEach((splitItem) => {
              const [ID_Checklist, valueCheck, gioht] = splitItem.split("/");
              const relatedChecklist = relatedChecklists.find(
                (rl) => rl.ID_Checklist === parseInt(ID_Checklist)
              );
              if (relatedChecklist) {
                arrPush.push({
                  ID_Checklist: parseInt(ID_Checklist),
                  Ketqua: valueCheck,
                  Gioht: gioht,
                  status: 1,
                  ent_checklist: relatedChecklist,
                });
              }
            });
          });
        }
      });

      const dataChecklistC = await Tb_checklistc.findByPk(ID_ChecklistC, {
        attributes: [
          "Ngay",
          "ID_KhoiCV",
          "ID_Duan",
          "Tinhtrang",
          "Giobd",
          "Giokt",
          "ID_User",
          "ID_Giamsat",
          "ID_Calv",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
          {
            model: Ent_calv,
            attributes: ["Tenca"],
          },
          {
            model: Ent_user,
            include: {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
            attributes: ["UserName", "Emails"],
          },
          {
            model: Ent_giamsat,
            attributes: ["Hoten"],
          },
        ],
        where: {
          isDelete: 0,
        },
      });

      res.status(200).json({
        message: "Danh sách checklist",
        data: arrPush,
        dataChecklistC: dataChecklistC,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

exports.checklistYear = async (req, res) => {
  try {
    const userData = req.user.data;
    const year = req.query.year || new Date().getFullYear(); // Get the year from the request, default to current year
    const khoi = req.query.khoi;
    if (!userData) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    // Define the where clause for the query
    let whereClause = {
      isDelete: 0,
      ID_Duan: userData.ID_Duan,
      Ngay: {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`,
      },
    };

    if (khoi !== "all") {
      whereClause.ID_KhoiCV = khoi;
    }

    // Fetch related checklist data
    const relatedChecklists = await Tb_checklistc.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("Ngay")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("TongC")), "totalChecklist"],
        [Sequelize.fn("SUM", Sequelize.col("Tong")), "total"],
      ],
      where: whereClause,
      group: [Sequelize.fn("MONTH", Sequelize.col("Ngay"))],
      raw: true,
    });

    // Process the data to match the required format
    let totalChecklistData = Array(12).fill(0);
    let totalData = Array(12).fill(0);

    relatedChecklists.forEach((item) => {
      const month = item.month - 1; // Adjust for zero-based index
      totalChecklistData[month] = item.totalChecklist;
      totalData[month] = item.total;
    });

    // Format the result as required
    const result = {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      series: [
        {
          type: String(year),
          data: [
            {
              name: "Kiểm tra",
              data: totalChecklistData,
            },
            {
              name: "Tổng",
              data: totalData,
            },
          ],
        },
      ],
    };

    res.status(200).json({
      message: "Danh sách checklist",
      data: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

exports.checklistPercent = async (req, res) => {
  try {
    const userData = req.user.data;

    if (!userData) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    let whereClause = {
      isDelete: 0,
      ID_Duan: userData.ID_Duan,
    };

    const results = await Tb_checklistc.findAll({
      include: [
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV"],
        },
      ],
      attributes: [
        [sequelize.col("ent_khoicv.KhoiCV"), "label"],
        [sequelize.col("tb_checklistc.tongC"), "totalAmount"],
        [
          sequelize.literal("tb_checklistc.tongC / tb_checklistc.tong * 100"),
          "value",
        ],
      ],
      where: whereClause,
    });

    // Chuyển đổi dữ liệu kết quả sang định dạng mong muốn
    const data = results.map((result) => {
      const { label, totalAmount, value } = result.get();
      return {
        label,
        totalAmount,
        value,
      };
    });
    processData(data).then((finalData) => {
      res.status(200).json({
        message: "Dữ liệu!",
        data: finalData,
      });
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

async function processData(data) {
  const aggregatedData = {};

  data.forEach((item) => {
    const { label, totalAmount, value } = item;

    if (!aggregatedData[label]) {
      aggregatedData[label] = {
        totalAmount: 0,
        totalValue: 0,
        count: 0,
      };
    }

    aggregatedData[label].totalAmount += totalAmount;
    if (value !== null) {
      aggregatedData[label].totalValue += parseFloat(value);
      aggregatedData[label].count++;
    }
  });

  const finalData = [];

  for (const label in aggregatedData) {
    const { totalAmount, totalValue, count } = aggregatedData[label];
    finalData.push({
      label,
      totalAmount,
      value: count > 0 ? (totalValue / count).toFixed(4) : null,
    });
  }

  return finalData;
}

// cron jib
cron.schedule("0 * * * *", async function () {
  console.log("---------------------");
  console.log("Running Cron Job");

  const currentDateTime = new Date();
  const currentDateString = currentDateTime.toISOString().split("T")[0];

  try {
    // Tìm các bản ghi thoả mãn điều kiện
    const results = await Tb_checklistc.findAll({
      attributes: [
        "ID_ChecklistC",
        "ID_Duan",
        "ID_KhoiCV",
        "ID_Calv",
        "ID_Toanha",
        "ID_User",
        "ID_Giamsat",
        "Ngay",
        "Tong",
        "TongC",
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
          model: Ent_calv,
          attributes: ["Giobatdau", "Gioketthuc"],
        },
      ],
      where: {
        isDelete: 0,
        Ngay: {
          [Op.lte]: currentDateString,
        },
      },
    });

    const updates = [];
    for (const record of results) {
      const { Gioketthuc } = record.ent_calv;
      const gioketthucDateTime = new Date(`${record.Ngay}T${Gioketthuc}`);

      if (currentDateTime > gioketthucDateTime) {
        updates.push(
          Tb_checklistc.update(
            { Tinhtrang: 1 },
            { where: { ID_ChecklistC: record.ID_ChecklistC } }
          )
        );
      }
    }

    await Promise.all(updates);

    console.log("Cron job completed successfully");
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});
