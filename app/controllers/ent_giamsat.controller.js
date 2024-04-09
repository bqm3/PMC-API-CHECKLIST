const { Ent_giamsat, Ent_duan, Ent_chucvu } = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  // Validate request
  try {
    if (
      !req.body.ID_Duan ||
      !req.body.Hoten ||
      !req.body.Sodienthoai ||
      !req.body.ID_Chucvu
    ) {
      res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }
    const userData = req.user.data;
    if (userData) {
      const data = {
        ID_Duan: req.body.ID_Duan || null,
        Hoten: req.body.Hoten || null,
        Gioitinh: req.body.Gioitinh || null,
        Sodienthoai: req.body.Sodienthoai || null,
        Ngaysinh: req.body.Ngaysinh || null,
        ID_Chucvu: req.body.ID_Chucvu || null,
        ID_KhoiCV: req.body.ID_KhoiCV || null,
        iQuyen: req.body.iQuyen || null,
        isDelete: 0,
      };

      Ent_giamsat.create(data)
        .then((data) => {
          res.status(200).json({
            message: "Tạo giám sát thành công!",
            data: data,
          });
        })
        .catch((err) => {
          console.log("err", err);
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
    if (userData) {
      let whereClause = {
        ID_Duan: userData?.ID_Duan,
        isDelete: 0,
      };
      // whereClause.ID_Chucvu = {
      //   [Op.not]: 1 // Exclude records where ID_Chucvu is 1
      // };

      // Nếu quyền là 1 (Permission === 1) thì không cần thêm điều kiện ID_KhoiCV
      if (userData.Permission !== 1) {
        whereClause.ID_KhoiCV = userData?.ID_KhoiCV;
        whereClause.ID_Chucvu = {
          [Op.not]: 1 // Exclude records where ID_Chucvu is 1
        };
      }

      await Ent_giamsat.findAll({
        attributes: [
          "ID_Giamsat",
          "ID_Duan",
          "ID_Chucvu",
          "ID_KhoiCV",
          "Hoten",
          "Ngaysinh",
          "Sodienthoai",
          "Gioitinh",
          "iQuyen",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
        ],
        where: whereClause,
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách giám sát!",
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
      await Ent_giamsat.findByPk(req.params.id, {
        attributes: [
          "ID_Giamsat",
          "ID_Duan",
          "ID_Chucvu",
          "ID_KhoiCV",
          "Hoten",
          "Ngaysinh",
          "Sodienthoai",
          "Gioitinh",
          "iQuyen",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Giám sát chi tiết!",
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
      if (!req.body.Hoten || !req.body.Sodienthoai) {
        res.status(400).json({
          message: "Cần nhập đầy đủ thông tin!",
        });
        return;
      }
      const reqData = {
        ID_Duan: req.body.ID_Duan,
        Hoten: req.body.Hoten,
        Gioitinh: req.body.Gioitinh,
        Sodienthoai: req.body.Sodienthoai,
        Ngaysinh: req.body.Ngaysinh,
        ID_Chucvu: req.body.ID_Chucvu,
        ID_KhoiCV: req.body.ID_KhoiCV,
        iQuyen: req.body.iQuyen,
        isDelete: 0,
      };

      Ent_giamsat.update(reqData, {
        where: {
          ID_Giamsat: req.params.id,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Cập nhật ca làm việc thành công!",
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
      Ent_giamsat.update(
        { isDelete: 1 },
        {
          where: {
            ID_Giamsat: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa ca làm việc thành công!",
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
