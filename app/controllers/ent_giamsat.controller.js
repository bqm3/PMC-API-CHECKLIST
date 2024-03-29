const { Ent_giamsat, Ent_duan, Ent_chucvu } = require("../models/setup.model");

exports.create = (req, res) => {
  // Validate request
  try {
    if (
      !req.body.ID_Duan ||
      !req.body.Hoten ||
      !req.body.Sodienthoai ||
      !req.body.ID_Chucvu ||
      !req.body.iQuyen 
    ) {
      res.status(400).send({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }
    const userData = req.user.data;
    if (userData) {
      const data = {
        ID_Duan: req.body.ID_Duan,
        Hoten: req.body.Hoten,
        Gioitinh: req.body.Gioitinh,
        Sodienthoai: req.body.Sodienthoai,
        Ngaysinh: req.body.Ngaysinh,
        ID_Chucvu: req.body.ID_Chucvu,
        iQuyen: req.body.iQuyen,
        isDelete: 0,
      };

      Ent_giamsat.create(data)
        .then((data) => {
          res.status(201).json({
            message: "Tạo giám sát thành công!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
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
      await Ent_giamsat.findAll({
        attributes: [
          "ID_Giamsat",
          "ID_Duan",
          "ID_Chucvu",
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
          res.status(201).json({
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
          res.status(201).json({
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
        res.status(400).send({
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
        iQuyen: req.body.iQuyen,
        isDelete: 0,
      };

      Ent_giamsat.update(reqData, {
        where: {
          ID_Giamsat: req.params.id,
        },
      })
        .then((data) => {
          res.status(201).json({
            message: "Cập nhật ca làm việc thành công!",
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).send({
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
          res.status(201).json({
            message: "Xóa ca làm việc thành công!",
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};