const { Ent_duan } = require("../models/setup.model");


exports.create = (req, res) => {
    try {
        const userData = req.user.data;
        if (userData && userData.Permission === 1) {
            if (!req.body.Duan) {
                res.status(400).send({
                    message: "Phải nhập đầy đủ dữ liệu!",
                });
                return;
            }

            // Create a Ent_duan
            const data = {
                Duan: req.body.Duan,
                isDelete: 0
            };

            // Save Ent_duan in the database
            Ent_duan.create(data)
                .then((data) => {
                    res.status(201).json({
                        message: "Tạo dự án thành công!",
                        data: data,
                    });
                })
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Lỗi! Vui lòng thử lại sau.",
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

exports.get = async (req, res) => {
    try {
      const userData = req.user.data;
      if (userData) {
        await Ent_duan.findAll({
          where: {
            isDelete: 0,
          },
        })
          .then((data) => {
            res.status(201).json({
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
      if (req.params.id && userData) {
        await Ent_duan.findByPk(req.params.id, {
          where: {
            isDelete: 0,
          },
        })
          .then((data) => {
            res.status(201).json({
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
