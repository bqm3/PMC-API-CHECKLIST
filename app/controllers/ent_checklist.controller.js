const sequelize = require("../config/db.config");
const {
  Ent_checklist,
  Ent_khuvuc,
  Ent_tang,
  Ent_user,
  Ent_chucvu,
  Ent_toanha,
  Ent_khoicv,
  Ent_duan,
  Tb_checklistchitiet,
  Tb_checklistchitietdone,
} = require("../models/setup.model");
const { Op } = require("sequelize");
const { getDataFormat } = require("./tb_checklistchitietdone.controller");

exports.create = (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      if (
        !req.body.ID_Khuvuc ||
        // !req.body.ID_Tang ||
        // !req.body.Sothutu ||
        // !req.body.Maso ||
        // !req.body.MaQrCode ||
        !req.body.Checklist ||
        // !req.body.Giatridinhdanh ||
        !req.body.Giatrinhan
      ) {
        res.status(400).json({
          message: "Phải nhập đầy đủ dữ liệu!",
        });
        return;
      }

      const data = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        Sothutu: req.body.Sothutu || "",
        Maso: req.body.Maso || "",
        MaQrCode: req.body.MaQrCode || "",
        Checklist: req.body.Checklist,
        Ghichu: req.body.Ghichu || "",
        Tieuchuan: req.body.Tieuchuan || "",
        Giatridinhdanh: req.body.Giatridinhdanh || "",
        Giatrinhan: req.body.Giatrinhan || "",
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      Ent_checklist.create(data)
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
    const pageSize = parseInt(req.query.limit) || 100; // Số lượng phần tử trên mỗi trang
    const offset = (page - 1) * pageSize;

    const orConditions = [];
    if (userData) {
      orConditions.push({
        "$ent_khuvuc.ent_toanha.ID_Duan$": userData.ID_Duan,
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
                attributes: ["ID_Duan", "Duan"],
                where: { ID_Duan: userData.ID_Duan },
              },
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
                attributes: ["ID_Duan", "Duan"],
                where: { ID_Duan: userData.ID_Duan },
              },
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
          "Sothutu",
          "Maso",
          "MaQrCode",
          "Checklist",
          "Ghichu",
          "Giatridinhdanh",
          "Giatrinhan",
          "ID_User",
          "isDelete",
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
            ],
            required: false,
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
      const reqData = {
        ID_Khuvuc: req.body.ID_Khuvuc,
        ID_Tang: req.body.ID_Tang,
        Sothutu: req.body.Sothutu,
        Maso: req.body.Maso,
        MaQrCode: req.body.MaQrCode,
        Checklist: req.body.Checklist,
        Ghichu: req.body.Ghichu,
        Giatridinhdanh: req.body.Giatridinhdanh,
        Giatrinhan: req.body.Giatrinhan,
        Sothutu: req.body.Sothutu,
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
    const ID_ChecklistC = req.params.idc;
    if (userData) {
      if (ID_Khuvuc !== undefined || ID_Khuvuc !== null) {
        orConditions.push({ ID_Khuvuc: ID_Khuvuc });
      }

      if (ID_Tang !== undefined || ID_Tang !== null) {
        orConditions.push({ ID_Tang: ID_Tang });
      }

      if (ID_Toanha !== undefined || ID_Toanha !== null) {
        orConditions.push({ "$ent_khuvuc.ent_toanha.ID_Toanha$": ID_Toanha });
      }

      const checklistItems = await Tb_checklistchitiet.findAll({
        attributes: ["ID_Checklist", "isDelete", "ID_ChecklistC"],
        where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
      });

      const checklistDoneItems = await Tb_checklistchitietdone.findAll({
        attributes: ["Description"],
        where: { isDelete: 0 },
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
            const [ID_ChecklistC, ID_Checklist, valueCheck, gioht] =
              splitItem.split("/");
            // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
            if (parseInt(ID_ChecklistC) === parseInt(req.params.idc)) {
              arrPush.push({
                ID_ChecklistC: parseInt(ID_ChecklistC),
                ID_Checklist: parseInt(ID_Checklist),
                valueCheck: valueCheck,
                gioht: gioht,
              });
            }
          });
        });
      });

      const checklistIds = checklistItems.map((item) => item.ID_Checklist);
      const checklistDoneIds = arrPush.map((item) => item.ID_Checklist);

      let whereCondition = {
        isDelete: 0,
      };

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
            model: Ent_khuvuc,
            attributes: [
              "Tenkhuvuc",
              "MaQrCode",
              "Makhuvuc",
              "Sothutu",
              "ID_Toanha",
              "ID_KhoiCV",
            ],
            required: false,
            where: {
              ID_KhoiCV: ID_KhoiCV,
            },
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
    if (!userData || !ID_KhoiCV) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }
    // const pageMaxSize =
    const checklistItems = await Tb_checklistchitiet.findAll({
      attributes: ["ID_Checklist", "isDelete", "ID_ChecklistC"],
      where: { isDelete: 0, ID_ChecklistC: ID_ChecklistC },
    });

    const checklistDoneItems = await Tb_checklistchitietdone.findAll({
      attributes: ["Description"],
      where: { isDelete: 0 },
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
          const [ID_ChecklistC, ID_Checklist, valueCheck, gioht] =
            splitItem.split("/");
          // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
          if (parseInt(ID_ChecklistC) === parseInt(req.params.idc)) {
            arrPush.push({
              ID_ChecklistC: parseInt(ID_ChecklistC),
              ID_Checklist: parseInt(ID_Checklist),
              valueCheck: valueCheck,
              gioht: gioht,
            });
          }
        });
      });
    });

    const checklistIds = checklistItems.map((item) => item.ID_Checklist);
    const checklistDoneIds = arrPush.map((item) => item.ID_Checklist);

    let whereCondition = {
      isDelete: 0,
    };

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

    const checklistData = await Ent_checklist.findAll({
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
          where: { ID_KhoiCV },
          include: [
            {
              model: Ent_toanha,
              attributes: ["Toanha", "Sotang", "ID_Toanha"],
              include: {
                model: Ent_duan,
                attributes: ["ID_Duan", "Duan"],
                where: { ID_Duan: userData.ID_Duan },
              },
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
      ],
    });

    if (!checklistData || checklistData.length === 0) {
      return res.status(200).json({
        message: "Không còn checklist cho ca làm việc này!",
        data: [],
      });
    }

    const filteredData = checklistData.filter(
      (item) => item.ent_khuvuc !== null
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
