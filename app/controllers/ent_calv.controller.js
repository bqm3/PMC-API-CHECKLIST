const {
  Ent_calv,
  Ent_duan,
  Ent_khoicv,
  Ent_user,
  Ent_chucvu,
} = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      let giokt = req.body.Gioketthuc;
      let giobd = req.body.Giobatdau;
      if (!req.body.Tenca) {
        return res.status(400).json({
          message: "Cần nhập đầy đủ thông tin!",
        });
      } else if (!giobd || !giokt) {
        return res.status(400).json({
          message: "Cần có thời gian bắt đầu và kết thúc!",
        });
      }
      if (giokt <= giobd && giobd < "20:00" && giokt >= "00:00") {
        return res.status(400).json({
          message: "Giờ kết thúc phải lớn hơn giờ bắt đầu!",
        });
      }

      const reqData = {
        ID_Duan: userData.ID_Duan,
        ID_KhoiCV: req.body.ID_KhoiCV,
        Tenca: req.body.Tenca,
        Giobatdau: giobd,
        Gioketthuc: giokt,
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      // Kiểm tra xem có ca làm việc nào đã tồn tại với ID_KhoiCV và Tenca tương tự không
      const existingCalv = await Ent_calv.findOne({
        where: {
          ID_KhoiCV: req.body.ID_KhoiCV,
          Tenca: req.body.Tenca,
          ID_Duan: userData.ID_Duan,
        },
        attributes: [
          "ID_Calv",
          "ID_KhoiCV",
          "ID_Duan",
          "Tenca",
          "Giobatdau",
          "Gioketthuc",
          "ID_User",
          "isDelete",
        ],
      });

      if (existingCalv) {
        return res.status(400).json({
          message: "Ca làm việc đã tồn tại!",
        });
      }

      // Nếu không có ca làm việc nào trùng, thêm mới
      Ent_calv.create(reqData)
        .then((data) => {
          res.status(200).json({
            message: "Tạo ca làm việc thành công!",
            data: data,
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
      }

      await Ent_calv.findAll({
        attributes: [
          "ID_Calv",
          "ID_KhoiCV",
          "ID_Duan",
          "Tenca",
          "Giobatdau",
          "Gioketthuc",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV", "ID_Khoi"],
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
        where: whereClause,
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách ca làm việc!",
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

exports.getFilter = async (req, res) => {
  try {
    const userData = req.user.data;
    const ID_KhoiCV = req.body.ID_KhoiCV;
    
    if (userData) {
      let whereClause = {
        ID_Duan: userData?.ID_Duan,
        isDelete: 0,
      };

      // Nếu quyền là 1 (Permission === 1) thì không cần thêm điều kiện ID_KhoiCV
      if (ID_KhoiCV !== null && ID_KhoiCV !== undefined) {
        whereClause.ID_KhoiCV = ID_KhoiCV;
      }
      

      await Ent_calv.findAll({
        attributes: [
          "ID_Calv",
          "ID_KhoiCV",
          "ID_Duan",
          "Tenca",
          "Giobatdau",
          "Gioketthuc",
          "ID_User",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV", "ID_Khoi"],
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
        where: whereClause,
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách ca làm việc!",
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
      await Ent_calv.findByPk(req.params.id, {
        attributes: [
          "ID_Calv",
          "ID_KhoiCV",
          "ID_Duan",
          "Tenca",
          "Giobatdau",
          "Gioketthuc",
          "ID_User",
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
          res.status(200).json({
            message: "Ca làm việc chi tiết!",
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
        message: "Không tồn tại ca làm việc",
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
      let giokt = req.body.Gioketthuc;
      let giobd = req.body.Giobatdau;
      if (!req.body.Tenca) {
        return res.status(400).json({
          message: "Cần nhập đầy đủ thông tin!",
        });
      } else if (!giobd || !giokt) {
        return res.status(400).json({
          message: "Cần có thời gian bắt đầu và kết thúc!",
        });
      } else if (giokt <= giobd && giobd < "20:00" && giokt >= "00:00") {
        return res.status(400).json({
          message: "Giờ kết thúc phải lớn hơn giờ bắt đầu!",
        });
      }

      // Kiểm tra xem có ca làm việc nào đã tồn tại với ID_KhoiCV và Tenca tương tự không
      // const existingCalv = await Ent_calv.findOne({
      //   where: {
      //     ID_KhoiCV: req.body.ID_KhoiCV,
      //     Tenca: req.body.Tenca,
      //     ID_Calv: {
      //       [Op.ne]: req.params.id, // Loại bỏ bản ghi hiện tại (với ID_Calv = req.params.id)
      //     },
      //   },
      //   attributes: [
      //     "ID_Calv",
      //     "ID_KhoiCV",
      //     "ID_Duan",
      //     "Tenca",
      //     "Giobatdau",
      //     "Gioketthuc",
      //     "ID_User",
      //     "isDelete",
      //   ],
      // });

      // if (existingCalv) {
      //   return res.status(400).json({
      //     message: "Ca làm việc đã tồn tại!",
      //   });
      // }

      const reqData = {
        ID_Duan: userData.ID_Duan,
        ID_KhoiCV: req.body.ID_KhoiCV,
        Tenca: req.body.Tenca,
        Giobatdau: req.body.Giobatdau,
        Gioketthuc: req.body.Gioketthuc,
        ID_User: userData.ID_User,
        isDelete: 0,
      };

      Ent_calv.update(reqData, {
        where: {
          ID_Calv: req.params.id,
        },
      })
        .then(() => {
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
      Ent_calv.update(
        { isDelete: 1 },
        {
          where: {
            ID_Calv: req.params.id,
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
