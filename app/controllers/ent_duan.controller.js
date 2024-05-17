const { Ent_duan } = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  try {
    const userData = req.user.data;

    if (!userData) {
      res.status(401).json({
        message: "Bạn không có quyền tạo dự án!",
      });
      return;
    }
    if (!req.body.Duan) {
      res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }

    // Create a Ent_duan
    const data = {
      Duan: req.body.Duan,
      Diachi: req.body.Diachi,
      Vido: req.body.Vido,
      Kinhdo: req.body.Kinhdo,
      isDelete: 0,
    };

    // Save Ent_duan in the database
    Ent_duan.create(data)
      .then((data) => {
        res.status(200).json({
          message: "Tạo dự án thành công!",
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

exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData && userData.ent_chucvu.Chucvu === "PSH") {
      await Ent_duan.findAll({
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else if (userData && userData.ent_chucvu.Chucvu !== "PSH") {
      await Ent_duan.findAll({
        where: {
          [Op.and]: {
            isDelete: 0,
            ID_Duan: userData.ID_Duan,
          },
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
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
    if (userData && userData.ent_chucvu.Chucvu === "PSH") {
      await Ent_duan.findByPk(req.params.id, {
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else if (userData && userData.ent_chucvu.Chucvu !== "PSH") {
      await Ent_duan.findAll({
        where: {
          [Op.and]: {
            isDelete: 0,
            ID_Duan: userData.ID_Duan,
          },
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
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

exports.update = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_duan.update(
        { Duan: req.body.Duan,  
          Diachi: req.body.Diachi,
          Vido: req.body.Vido,
          Kinhdo: req.body.Kinhdo },
        {
          where: {
            ID_Duan: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Dự án chi tiết!",
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

exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_duan.update(
        { isDelete: 1 },
        {
          where: {
            ID_Duan: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa dự án thành công!",
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
