const {
  Ent_user,
  Ent_duan,
  Ent_khoicv,
  Ent_chucvu,
} = require("../models/setup.model");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { Op } = require("sequelize");

// Login User
exports.login = async (req, res) => {
  try {
    if (!req.body.UserName || !req.body.Password) {
      res.status(400).send({
        message: "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!!",
      });
      return;
    }
    const user = await Ent_user.findOne({
      where: {
        UserName: req.body.UserName,
      },
      attributes: [
        "ID_User",
        "UserName",
        "Permission",
        "ID_Duan",
        "Password",
        "ID_KhoiCV",
        "Emails",
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
      ]
    });

    if (user && user?.isDelete === 0) {
      const password_valid = await compareSync(
        req.body.Password,
        user.Password
      );
      if (password_valid) {
        token = jsonwebtoken.sign(
          {
            data: user,
          },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: "7d",
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          SameSite: "strict",
          expires: new Date(Number(new Date()) + 7 * 24 * 60 * 60 * 1000),
        }); //we add secure: true, when using https.

        return res.status(200).send({ token: token, user: user });
      } else {
        return res
          .status(400)
          .json({ error: "Sai mật khẩu. Vui lòng thử lại." });
      }
    } else {
      return res.status(400).json({
        error:
          "Bạn không thể đăng nhập. Vui lòng nhắn tin cho phòng chuyển đổi số.",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err ? err.message : "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// Create User
exports.register = async (req, res, next) => {
  try {
    if (
      !req.body.UserName ||
      !req.body.Emails ||
      !req.body.Password ||
      !req.body.Permission ||
      !req.body.ID_Duan ||
      !req.body.ID_KhoiCV
    ) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu.",
      });
    }
    const UserName = req.body.UserName;
    const Emails = req.body.Emails;
    const user = await Ent_user.findOne({
      where: {
        [Op.or]: [{ UserName }, { Emails }],
      },
      attributes: [
        "ID_User",
        "UserName",
        "Permission",
        "ID_Duan",
        "Password",
        "ID_KhoiCV",
        "Emails",
        "isDelete",
      ],
    });

    if (user !== null) {
      return res.status(400).json({
        message: "Tài khoản hoặc Email đã bị trùng.",
      });
    }
    const salt = genSaltSync(10);
    var data = {
      UserName: req.body.UserName,
      Emails: req.body.Emails,
      Password: await hashSync(req.body.Password, salt),
      Permission: req.body.Permission,
      ID_Duan: req.body.ID_Duan,
      ID_KhoiCV: req.body.ID_KhoiCV,
      isDelete: 0,
    };

    Ent_user.create(data)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau",
    });
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
    }

    const userData = req.user.data;
    if (userData) {
      const { currentPassword, newPassword } = req.body;
      const isPasswordValid = await compareSync(
        currentPassword,
        userData?.Password
      );
      if (!isPasswordValid) {
        return res.status(403).json({ message: "Sai mật khẩu" });
      }
      const hashedNewPassword = await hashSync(newPassword, 10);
      await Ent_user.update(
        {
          Password: hashedNewPassword,
        },
        {
          where: {
            ID_User: userData.ID_User,
          },
        }
      )
        .then((data) => {
          res.status(201).send({
            message: "Cập nhật mật khẩu thành công!",
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

// Get All User
exports.deleteUser = async (req, res, next) => {
  try {
    if (!req.body?.isDelete || !req.body.ID_User) {
      return res.status(400).send({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
    }

    const userData = req.user.data;

    if (userData.ID_User !== req.body.ID_User) {
      const ID_User = req.body.ID_User;
      await Ent_user.update(
        {
          isDelete: req.body.isDelete,
        },
        {
          where: {
            ID_User: ID_User,
          },
        }
      )
        .then((data) => {
          res.status(201).json({
            message: "Xóa tài khoản thành công!",
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

// Get User Online
exports.getUserOnline = async (req, res, next) => {
  try {
    const userData = req.user.data;
    //
    await Ent_user.findAll({
      attributes: ["UserName", "Emails", "ID_Duan", "ID_KhoiCV", "Permission"],
      include: [
        {
          association: "ent_duan",
          required: true,
        },
      ],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(201).json({
          message: "Danh sách nhân viên!",
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

