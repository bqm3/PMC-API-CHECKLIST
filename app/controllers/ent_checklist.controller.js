const sequelize = require("../config/db.config");
const xlsx = require("xlsx");
const {
  Ent_checklist,
  Ent_khuvuc,
  Ent_tang,
  Ent_user,
  Ent_chucvu,
  Ent_toanha,
  Ent_khoicv,
  Ent_duan,
  Ent_hangmuc,
  Tb_checklistchitiet,
  Tb_checklistchitietdone,
  Tb_checklistc,
  Ent_calv,
} = require("../models/setup.model");
const { Op, Sequelize } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      if (!req.body.Checklist || !req.body.Giatrinhan) {
        res.status(400).json({
          message: "Phải nhập đầy đủ dữ liệu!",
        });
        return;
      }
      // const sCalv = req.body.sCalv;
      const sCalv = req.body.sCalv;

      const data = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        ID_Hangmuc: req.body.ID_Hangmuc,
        Sothutu: req.body.Sothutu || 0,
        Maso: req.body.Maso || "",
        MaQrCode: req.body.MaQrCode || "",
        Checklist: req.body.Checklist,
        Ghichu: req.body.Ghichu || "",
        Tieuchuan: req.body.Tieuchuan || "",
        Giatridinhdanh:
          req.body.Giatridinhdanh || req.body.Giatrinhan.split("/")[0] || "",
        Giatrinhan: req.body.Giatrinhan || "",
        ID_User: userData.ID_User,
        sCalv: JSON.stringify(sCalv) || null,
        calv_1: JSON.stringify(sCalv[0]) || null,
        calv_2: JSON.stringify(sCalv[1]) || null,
        calv_3: JSON.stringify(sCalv[2]) || null,
        calv_4: JSON.stringify(sCalv[3]) || null,
        isDelete: 0,
        Tinhtrang: 0,
      };

      Ent_checklist.create(data)
        .then(async (data) => {
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
    if (!userData) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    const page = parseInt(req.query.page) || 1;
    // const pageSize = 500;
    const pageSize = parseInt(req.query.limit) || 100; // Số lượng phần tử trên mỗi trang
    const offset = (page - 1) * pageSize;

    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$": userData?.ID_Duan,
      });
    }

    const totalCount = await Ent_checklist.count({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Tang",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "ID_User",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: {
        isDelete: 0,
        [Op.and]: [orConditions],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const data = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Tang",
        "ID_Hangmuc",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "sCalv",
        "Tinhtrang",
        "calv_1",
        "calv_2",
        "calv_3",
        "calv_4",
        "ID_User",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: {
        isDelete: 0,
        [Op.and]: [orConditions],
      },
      order: [
        ["ID_Khuvuc", "ASC"],
        ["Sothutu", "ASC"],
      ],
      offset: offset,
      limit: pageSize,
    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = data.filter((item) => item.ent_khuvuc !== null);

    if (filteredData.length > 0) {
      return res.status(200).json({
        message: "Danh sách checklist!",
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
        totalCount: totalCount,
        data: filteredData,
      });
    } else {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
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
      await Ent_checklist.findByPk(req.params.id, {
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Tang",
          "ID_Hangmuc",
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Ghichu",
          "Tieuchuan",
          "Giatridinhdanh",
          "Giatrinhan",
          "sCalv",
          "calv_1",
          "calv_2",
          "calv_3",
          "calv_4",
          "ID_User",
          "isDelete",
          "Tinhtrang",
        ],
        include: [
          {
            model: Ent_hangmuc,
            attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV"],
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
                        "Logo",
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
            include: {
              model: Ent_chucvu,
              attributes: ["Chucvu"],
            },
            attributes: ["UserName", "Emails"],
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

exports.update = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      if (!req.body.Giatrinhan || !req.body.Checklist) {
        res.status(400).json({
          message: "Cần nhập đầy đủ thông tin!",
        });
        return;
      }
      const sCalv = req.body.sCalv;

      const reqData = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        ID_Hangmuc: req.body.ID_Hangmuc,
        Sothutu: req.body.Sothutu,
        Maso: req.body.Maso,
        MaQrCode: req.body.MaQrCode,
        Checklist: req.body.Checklist,
        Ghichu: req.body.Ghichu,
        Giatridinhdanh: req.body.Giatridinhdanh,
        Giatrinhan: req.body.Giatrinhan,
        Sothutu: req.body.Sothutu,
        Ghichu: req.body.Ghichu || "",
        Tieuchuan: req.body.Tieuchuan || "",
        sCalv: JSON.stringify(sCalv) || null,
        calv_1: JSON.stringify(sCalv[0]) || null,
        calv_2: JSON.stringify(sCalv[1]) || null,
        calv_3: JSON.stringify(sCalv[2]) || null,
        calv_4: JSON.stringify(sCalv[3]) || null,
        isDelete: 0,
      };

      Ent_checklist.update(reqData, {
        where: {
          ID_Checklist: req.params.id,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Cập nhật checklist thành công!",
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
      Ent_checklist.update(
        { isDelete: 1 },
        {
          where: {
            ID_Checklist: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa checklist thành công!",
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

// filter data
exports.getFilter = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_Khuvuc = req.body.ID_Khuvuc;
    const ID_Tang = req.body.ID_Tang;
    const ID_Toanha = req.body.ID_Toanha;
    const orConditions = [];

    const ID_KhoiCV = req.params.id;
    const ID_Calv = req.params.id_calv;
    const ID_ChecklistC = req.params.idc;
    const ID_Hangmuc = req.params.id_hm;

    if (userData) {
      if (ID_Khuvuc !== null && ID_Khuvuc !== undefined) {
        orConditions.push({ ID_Khuvuc: ID_Khuvuc });
      }

      if (ID_Hangmuc !== null) {
        orConditions.push({ ID_Hangmuc: ID_Hangmuc });
      }

      if (ID_Tang !== null) {
        orConditions.push({ ID_Tang: ID_Tang });
      }

      if (ID_Toanha !== null) {
        orConditions.push({ "$ent_khuvuc.ent_toanha.ID_Toanha$": ID_Toanha });
      }

      const checklistItems = await Tb_checklistchitiet.findAll({
        attributes: ["ID_Checklist", "isDelete", "ID_ChecklistC"],
        where: { isDelete: 0 },
      });

      const checklistDoneItems = await Tb_checklistchitietdone.findAll({
        attributes: ["Description", "isDelete", "ID_ChecklistC"],
        where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
      });

      const arrPush = [];

      // Duyệt qua từng phần tử trong mảng checklistDoneItems
      checklistDoneItems.forEach((item) => {
        // Chuyển đổi chuỗi JSON thành một đối tượng JavaScript
        const descriptionArray = JSON.parse(item.dataValues.Description);

        // Lặp qua mỗi phần tử của mảng descriptionArray
        descriptionArray.forEach((description) => {
          // Tách các mục dữ liệu trước dấu phẩy (,)
          const splitByComma = description.split(",");

          // Lặp qua mỗi phần tử sau khi tách
          splitByComma.forEach((splitItem) => {
            // Trích xuất thông tin từ mỗi chuỗi
            const [ID_Checklist, valueCheck, gioht] = splitItem.split("/");
            // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
            arrPush.push({
              ID_Checklist: parseInt(ID_Checklist),
              valueCheck: valueCheck,
              gioht: gioht,
            });
          });
        });
      });

      const checklistIds = checklistItems.map((item) => item.ID_Checklist);
      const checklistDoneIds = arrPush.map((item) => item.ID_Checklist);

      let whereCondition = {
        isDelete: 0,
        ID_Hangmuc,
        [Op.or]: [
          { calv_1: ID_Calv },
          { calv_2: ID_Calv },
          { calv_3: ID_Calv },
          { calv_4: ID_Calv },
        ],
      };
      whereCondition["$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$"] =
        userData?.ID_Duan;
      whereCondition["$ent_hangmuc.ID_KhoiCV$"] = ID_KhoiCV;

      if (
        checklistIds &&
        Array.isArray(checklistIds) &&
        checklistIds.length > 0 &&
        checklistDoneIds &&
        checklistDoneIds.length > 0
      ) {
        whereCondition.ID_Checklist = {
          [Op.notIn]: [...checklistIds, ...checklistDoneIds],
        };
      } else if (
        checklistIds &&
        Array.isArray(checklistIds) &&
        checklistIds.length > 0
      ) {
        whereCondition.ID_Checklist = {
          [Op.notIn]: checklistIds,
        };
      } else if (checklistDoneIds && checklistDoneIds.length > 0) {
        whereCondition.ID_Checklist = {
          [Op.notIn]: checklistDoneIds,
        };
      }

      await Ent_checklist.findAll({
        attributes: [
          "ID_Checklist",
          "ID_Khuvuc",
          "ID_Tang",
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
          "isDelete",
        ],
        include: [
          {
            model: Ent_hangmuc,
            attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV"],
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
              },
            ],
          },
          {
            model: Ent_tang,
            attributes: ["Tentang", "Sotang"],
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
        where: {
          isDelete: 0,
          [Op.and]: [orConditions, whereCondition],
        },
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

exports.deleteChecklists = async (req, res) => {
  try {
    const ids = req.params.ids.split(",");
    const userData = req.user.data;

    if (ids && userData) {
      Ent_checklist.update(
        { isDelete: 1 },
        {
          where: {
            ID_Checklist: ids,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa checklist thành công!",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// get data
exports.getChecklist = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_KhoiCV = req.params.id;
    const ID_ChecklistC = req.params.idc;
    const ID_Calv = req.params.id_calv;
    const ID_Hangmuc = req.params.id_hm;
    if (!userData || !ID_KhoiCV) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }
    // const pageMaxSize =
    const checklistItems = await Tb_checklistchitiet.findAll({
      attributes: ["isDelete", "ID_Checklist"],
      where: { isDelete: 0 },
    });

    const checklistDoneItems = await Tb_checklistchitietdone.findAll({
      attributes: ["Description", "isDelete", "ID_ChecklistC"],
      where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
    });

    const arrPush = [];

    // Duyệt qua từng phần tử trong mảng checklistDoneItems
    if (checklistDoneItems.length > 0) {
      checklistDoneItems.forEach((item) => {
        // Chuyển đổi chuỗi JSON thành một đối tượng JavaScript
        const descriptionArray = JSON.parse(item.dataValues.Description);

        // Kiểm tra xem descriptionArray có phải là mảng hay không
        if (Array.isArray(descriptionArray)) {
          // Nếu là mảng, thực hiện xử lý như trong mã của bạn
          descriptionArray.forEach((description) => {
            // Tách các mục dữ liệu trước dấu phẩy (,)
            const splitByComma = description.split(",");

            // Lặp qua mỗi phần tử sau khi tách
            splitByComma.forEach((splitItem) => {
              // Trích xuất thông tin từ mỗi chuỗi
              const [ID_Checklist, valueCheck, gioht] = splitItem.split("/");

              // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
              arrPush.push({
                ID_Checklist: parseInt(ID_Checklist),
                valueCheck: valueCheck,
                gioht: gioht,
              });
            });
          });
        } else {
          console.log("descriptionArray không phải là một mảng.");
        }
      });
    }

    const checklistIds = checklistItems.map((item) => item?.ID_Checklist) || [];
    const checklistDoneIds = arrPush.map((item) => item?.ID_Checklist) || [];

    let whereCondition = {
      isDelete: 0,
      ID_Hangmuc,
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

    console.log("where", whereCondition);
    if (
      checklistIds &&
      Array.isArray(checklistIds) &&
      checklistIds.length > 0 &&
      checklistDoneIds &&
      checklistDoneIds.length > 0
    ) {
      console.log("run -1");
      whereCondition.ID_Checklist = {
        [Op.notIn]: [...checklistIds, ...checklistDoneIds],
      };
    } else if (
      checklistIds &&
      Array.isArray(checklistIds) &&
      checklistIds.length > 0 &&
      checklistDoneIds.length === 0
    ) {
      console.log("run -2");
      whereCondition.ID_Checklist = {
        [Op.notIn]: checklistIds,
      };
    } else if (
      checklistDoneIds &&
      checklistDoneIds.length > 0 &&
      checklistIds.length == 0
    ) {
      console.log("run -3");
      whereCondition.ID_Checklist = {
        [Op.notIn]: checklistDoneIds,
      };
    }

    const checklistData = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Hangmuc",
        "ID_Tang",
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
          model: Ent_tang,
          attributes: ["Tentang", "Sotang"],
        },
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
                    ],
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
        ["ID_Checklist", "ASC"],
      ],
    });

    if (!checklistData || checklistData.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = checklistData.filter(
      (item) => item.ent_hangmuc !== null
    );

    return res.status(200).json({
      message:
        filteredData.length > 0
          ? "Danh sách checklist!"
          : "Không còn checklist cho ca làm việc này!",
      length: filteredData.length,
      data: filteredData,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// get data filter search
exports.getFilterSearch = async (req, res) => {
  try {
    const userData = req.user.data;
    if (!userData) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    const ID_Khuvuc = req.body.ID_Khuvuc;
    const ID_Tang = req.body.ID_Tang;
    const ID_Hangmuc = req.body.ID_Hangmuc;

    const page = parseInt(req.query.page) || 1;
    // const pageSize = 500;
    const pageSize = parseInt(req.query.limit) || 100; // Số lượng phần tử trên mỗi trang
    const offset = (page - 1) * pageSize;

    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$": userData.ID_Duan,
      });
    }

    if (ID_Khuvuc !== null) {
      orConditions.push({
        "$ent_hangmuc.ent_khuvuc.ID_Khuvuc$": ID_Khuvuc,
      });
    }

    if (ID_Tang !== null) {
      orConditions.push({
        ID_Tang: ID_Tang,
      });
    }

    if (ID_Hangmuc !== null) {
      orConditions.push({
        ID_Hangmuc: ID_Hangmuc,
      });
    }

    const totalCount = await Ent_checklist.count({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Tang",
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
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: {
        isDelete: 0,
        [Op.and]: [orConditions],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const data = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Hangmuc",
        "ID_Tang",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "ID_User",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: {
        isDelete: 0,
        [Op.and]: [orConditions],
      },
      order: [
        ["ID_Khuvuc", "ASC"],
        ["Sothutu", "ASC"],
        ["ID_Checklist", "ASC"],
      ],
      offset: offset,
      limit: pageSize,
    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = data.filter((item) => item.ent_khuvuc !== null);

    if (filteredData.length > 0) {
      return res.status(200).json({
        message: "Danh sách checklist!",
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
        data: filteredData,
      });
    } else {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.filterChecklists = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_ChecklistC = req.params.idc;
    const ID_Calv = req.params.id_calv;
    const ID_Hangmuc = req.body.ID_Hangmuc;

    const tbChecklist = await Tb_checklistc.findByPk(ID_ChecklistC, {
      attributes: ["ID_Toanha", "ID_Khuvucs", "isDelete"],
      where: {
        isDelete: 0
      }
    })

    // const pageMaxSize =
    const checklistItems = await Tb_checklistchitiet.findAll({
      attributes: ["isDelete", "ID_Checklist", "ID_ChecklistC"],
      where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
    });

    const checklistDoneItems = await Tb_checklistchitietdone.findAll({
      attributes: ["Description", "isDelete", "ID_ChecklistC"],
      where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
    });

    const arrPush = [];

    // Duyệt qua từng phần tử trong mảng checklistDoneItems
    if (checklistDoneItems.length > 0) {
      checklistDoneItems.forEach((item) => {
        // Chuyển đổi chuỗi JSON thành một đối tượng JavaScript
        const descriptionArray = JSON.parse(item.dataValues.Description);

        // Kiểm tra xem descriptionArray có phải là mảng hay không
        if (Array.isArray(descriptionArray)) {
          // Nếu là mảng, thực hiện xử lý như trong mã của bạn
          descriptionArray.forEach((description) => {
            // Tách các mục dữ liệu trước dấu phẩy (,)
            const splitByComma = description.split(",");

            // Lặp qua mỗi phần tử sau khi tách
            splitByComma.forEach((splitItem) => {
              // Trích xuất thông tin từ mỗi chuỗi
              const [ID_Checklist, valueCheck, gioht] = splitItem.split("/");

              // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
              arrPush.push({
                ID_Checklist: parseInt(ID_Checklist),
                valueCheck: valueCheck,
                gioht: gioht,
              });
            });
          });
        } else {
          console.log("descriptionArray không phải là một mảng.");
        }
      });
    }

    const checklistIds = checklistItems.map((item) => item?.ID_Checklist) || [];
    const checklistDoneIds = arrPush.map((item) => item?.ID_Checklist) || [];

    
    let whereCondition = {
      isDelete: 0,
      ID_Hangmuc,
      [Op.or]: [
        { calv_1: ID_Calv },
        { calv_2: ID_Calv },
        { calv_3: ID_Calv },
        { calv_4: ID_Calv },
      ],
    };

    
    
    if (Array.isArray(tbChecklist.ID_Khuvucs) && tbChecklist.ID_Khuvucs.length > 0) {
      whereCondition.ID_Khuvuc = {
        [Op.in]: tbChecklist.ID_Khuvucs
      };
    }

    whereCondition["$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$"] =
      userData?.ID_Duan;
    whereCondition["$ent_hangmuc.ID_KhoiCV$"] = userData?.ID_KhoiCV;

    

    if (
      checklistIds &&
      Array.isArray(checklistIds) &&
      checklistIds.length > 0 &&
      checklistDoneIds &&
      checklistDoneIds.length > 0
    ) {
      whereCondition.ID_Checklist = {
        [Op.notIn]: [...checklistIds, ...checklistDoneIds],
      };
    } else if (
      checklistIds &&
      Array.isArray(checklistIds) &&
      checklistIds.length > 0 &&
      checklistDoneIds.length === 0
    ) {
      whereCondition.ID_Checklist = {
        [Op.notIn]: checklistIds,
      };
    } else if (
      checklistDoneIds &&
      checklistDoneIds.length > 0 &&
      checklistIds.length == 0
    ) {
      whereCondition.ID_Checklist = {
        [Op.notIn]: checklistDoneIds,
      };
    }

    console.log('whereCondition', whereCondition)

    const checklistData = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Hangmuc",
        "ID_Tang",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "Tinhtrang",
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
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
        ["ID_Checklist", "ASC"],
      ],
    });

    if (!checklistData || checklistData.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = checklistData.filter(
      (item) => item.ent_hangmuc !== null
    );

    return res.status(200).json({
      message:
        filteredData.length > 0
          ? "Danh sách checklist!"
          : "Không còn checklist cho ca làm việc này!",
      length: filteredData.length,
      data: filteredData,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getListChecklistWeb = async (req, res) => {
  try {
    const userData = req.user.data;
    if (!userData) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$": userData?.ID_Duan,
      });
    }

    const data = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Tang",
        "ID_Hangmuc",
        "Sothutu",
        "Maso",
        "MaQrCode",
        "Checklist",
        "Ghichu",
        "Tieuchuan",
        "Giatridinhdanh",
        "Giatrinhan",
        "sCalv",
        "Tinhtrang",
        "calv_1",
        "calv_2",
        "calv_3",
        "calv_4",
        "ID_User",
        "isDelete",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: {
        isDelete: 0,
        [Op.and]: [orConditions],
      },
      order: [
        ["ID_Khuvuc", "ASC"],
        ["Sothutu", "ASC"],
      ],
    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = data.filter((item) => item.ent_khuvuc !== null);

    if (filteredData.length > 0) {
      return res.status(200).json({
        message: "Danh sách checklist!",
        data: filteredData,
      });
    } else {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getChecklistTotal = async (req, res) => {
  try {
    const userData = req.user.data;
    if (!userData) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    let whereCondition = {
      isDelete: 0,
    };

    whereCondition["$ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan$"] =
      userData?.ID_Duan;

    const checklistData = await Ent_checklist.findAll({
      attributes: [
        "ID_Checklist",
        "ID_Khuvuc",
        "ID_Hangmuc",
        "ID_Tang",
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
          attributes: ["Hangmuc", "Tieuchuankt", "ID_Khuvuc", "MaQrCode", "ID_KhoiCV","ID_KhoiCV"],
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
                      "Logo",
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
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          attributes: ["UserName", "Emails"],
        },
      ],
      where: whereCondition,
    });

    if (!checklistData || checklistData.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    // Filter data
    const filteredData = checklistData.filter(
      (item) => item.ent_hangmuc !== null
    );

    // Count checklists by ID_KhoiCV
    const checklistCounts = {};
    filteredData.forEach((item) => {
      const khoiCV = item.ent_hangmuc.ent_khoicv.KhoiCV;
      if (!checklistCounts[khoiCV]) {
        checklistCounts[khoiCV] = 0;
      }
      checklistCounts[khoiCV]++;
    });

    // Convert counts to desired format
    const result = Object.keys(checklistCounts).map((khoiCV) => ({
      label: khoiCV,
      value: checklistCounts[khoiCV],
    }));

    return res.status(200).json({
      message:
        result.length > 0
          ? "Danh sách checklist!"
          : "Không còn checklist cho ca làm việc này!",
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

    await sequelize.transaction(async (transaction) => {
      for (const item of updatedData) {
        const maQrCodeHangMuc = item["Mã QrCode hạng mục"];
        const tenTang = item["Tên tầng"];
        const tenKhoiCongViec = item["Tên khối công việc"];
        const caChecklist = item["Ca checklist"];
        const maChecklist = item["Mã checklist"];
        const qrChecklist = item["Mã QrCode checklist"];
        const tenChecklist = item["Tên checklist"];
        const tieuChuanChecklist = item["Tiêu chuẩn checklist"];
        const giaTriDanhDinh = item["Giá trị danh định"];
        const cacGiaTriNhan = item["Các giá trị nhận"];
        const ghiChu = item["Ghi chú"];

        const hangmuc = await Ent_hangmuc.findOne({
          attributes: [
            "Hangmuc",
            "Tieuchuankt",
            "ID_Khuvuc",
            "MaQrCode",
            "ID_Hangmuc",
          ],
          where: { MaQrCode: maQrCodeHangMuc },
          transaction,
        });

        const tang = await Ent_tang.findOne({
          attributes: ["Tentang", "Sotang", "ID_Tang", "ID_Duan"],
          where: {
            Tentang: sequelize.where(
              sequelize.fn("UPPER", sequelize.col("Tentang")),
              "LIKE",
              "%" + tenTang.toUpperCase() + "%"
            ),
            ID_Duan: userData.ID_Duan,
          },
          transaction,
        });

        const khoiCV = await Ent_khoicv.findOne({
          attributes: ["ID_Khoi", "KhoiCV"],
          where: { KhoiCV: tenKhoiCongViec },
          transaction,
        });

        const caChecklistArray = caChecklist.split(",").map((ca) => ca.trim());
        const calv = await Ent_calv.findAll({
          attributes: ["ID_Calv", "ID_Duan", "ID_KhoiCV", "Tenca"],
          where: {
            TenCa: caChecklistArray,
            ID_Duan: userData.ID_Duan,
            ID_KhoiCV: khoiCV.ID_Khoi,
          },
          transaction,
        });
        const sCalv = calv.map((calvItem) => calvItem.ID_Calv);

        const data = {
          ID_Khuvuc: hangmuc.ID_Khuvuc,
          ID_Tang: tang.ID_Tang,
          ID_Hangmuc: hangmuc.ID_Hangmuc,
          Sothutu: 1,
          Maso: maChecklist || "",
          MaQrCode: qrChecklist || "",
          Checklist: tenChecklist,
          Ghichu: ghiChu || "",
          Tieuchuan: tieuChuanChecklist || "",
          Giatridinhdanh: giaTriDanhDinh || "",
          Giatrinhan: cacGiaTriNhan || "",
          ID_User: userData.ID_User,
          sCalv: JSON.stringify(sCalv) || null,
          calv_1: JSON.stringify(sCalv[0]) || null,
          calv_2: JSON.stringify(sCalv[1]) || null,
          calv_3: JSON.stringify(sCalv[2]) || null,
          calv_4: JSON.stringify(sCalv[3]) || null,
          isDelete: 0,
          Tinhtrang: 0,
        };

        await Ent_checklist.create(data, { transaction });
      }
    });

    res.send({
      message: "File uploaded and data extracted successfully",
      data,
    });
  } catch (err) {
    console.log('err', err)
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