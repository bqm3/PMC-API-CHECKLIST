const {
  Ent_giamsat,
  Ent_duan,
  Ent_chucvu,
  Ent_khoicv,
} = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  // Validate request
  try {
    if (!req.body.Hoten || !req.body.ID_Chucvu) {
      res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }

    const userData = req.user.data;
    if (userData) {
      const {
        ID_Duan,
        Hoten,
        Gioitinh,
        Sodienthoai,
        Ngaysinh,
        ID_Chucvu,
        ID_KhoiCV,
        iQuyen,
      } = req.body;

      // Kiểm tra xem số điện thoại đã tồn tại trong cơ sở dữ liệu hay chưa
      const existingEntry = await Ent_giamsat.findOne({
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
        where: { Sodienthoai },
      });
      if (existingEntry) {
        return res.status(400).json({
          message: "Số điện thoại đã tồn tại!",
        });
      }

      // Nếu số điện thoại chưa tồn tại, tạo bản ghi mới
      const data = {
        ID_Duan: ID_Duan || null,
        Hoten: Hoten || null,
        Gioitinh: Gioitinh || null,
        Sodienthoai: Sodienthoai || null,
        Ngaysinh: Ngaysinh || null,
        ID_Chucvu: ID_Chucvu || null,
        ID_KhoiCV: ID_KhoiCV || null,
        iQuyen: iQuyen || null,
        isDelete: 0,
      };

      // Tạo bản ghi mới
      const newRecord = await Ent_giamsat.create(data);
      res.status(201).json({
        message: "Tạo giám sát thành công!",
        data: newRecord,
      });
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({
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

      // Nếu quyền là 1 (Permission === 1) thì không cần thêm điều kiện ID_KhoiCV
      if (userData.Permission !== 1) {
        whereClause.ID_KhoiCV = userData?.ID_KhoiCV;
        whereClause.ID_Chucvu = {
          [Op.not]: 1, // Exclude records where ID_Chucvu is 1
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
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi", "KhoiCV"],
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
          {
            model: Ent_khoicv,
            attributes: ["ID_Khoi"],
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
      // Kiểm tra xem số điện thoại đã tồn tại trong cơ sở dữ liệu hay chưa, ngoại trừ bản ghi hiện tại đang được cập nhật
      const existingEntry = await Ent_giamsat.findOne({
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
        where: {
          Sodienthoai: req.body.Sodienthoai,
          ID_Giamsat: {
            [Op.ne]: req.params.id, // Loại trừ bản ghi hiện tại đang được cập nhật
          },
        },
      });

      if (existingEntry) {
        return res.status(400).json({
          message: "Số điện thoại đã tồn tại!",
        });
      }

      // Nếu kiểm tra không phát hiện số điện thoại trùng, tiếp tục cập nhật bản ghi
      const reqData = {
        ID_Duan: userData?.ID_Duan || null,
        Hoten: req.body.Hoten || null,
        Gioitinh: req.body.Gioitinh || null,
        Sodienthoai: req.body.Sodienthoai || null,
        Ngaysinh: req.body.Ngaysinh || null,
        ID_Chucvu: req.body.ID_Chucvu || null,
        ID_KhoiCV: req.body.ID_KhoiCV || null,
        iQuyen: req.body.iQuyen || 1,
        isDelete: 0,
      };

      await Ent_giamsat.update(reqData, {
        where: {
          ID_Giamsat: req.params.id,
        },
      });

      res.status(200).json({
        message: "Cập nhật ca làm việc thành công!",
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
