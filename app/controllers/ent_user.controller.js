const {
  Ent_user,
  Ent_duan,
  Ent_khoicv,
  Ent_chucvu,
} = require("../models/setup.model");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { Op } = require("sequelize");

// Login User
exports.login = async (req, res) => {
  try {
    // Check if username and password are provided
    if (!req.body.UserName || !req.body.Password) {
      return res.status(400).json({
        message: "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!!",
      });
    }

    // Find user by username
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
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV"],
        },
      ],
    });

    // Check if user exists and is not deleted
    if (user && user.isDelete === 0) {
      // Compare passwords
      const passwordValid = await bcrypt.compare(
        req.body.Password,
        user.Password
      );

      if (passwordValid) {
        // Generate JWT token
        const token = jsonwebtoken.sign(
          {
            data: user,
          },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: "7d",
          }
        );

        // Set token as cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return res.status(200).json({ token: token, user: user });
      } else {
        // Incorrect password
        return res
          .status(400)
          .json({ message: "Sai mật khẩu. Vui lòng thử lại." });
      }
    } else {
      // User not found or deleted
      return res.status(400).json({
        message:
          "Bạn không thể đăng nhập. Vui lòng nhắn tin cho phòng chuyển đổi số.",
      });
    }
  } catch (err) {
    // Internal server error
    return res.status(500).json({
      message: err ? err.message : "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// Create User
exports.register = async (req, res, next) => {
  try {
    if (!req.body.UserName || !req.body.Password || !req.body.Permission) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu.",
      });
    }
    const UserName = req.body.UserName;
    const Emails = req.body.Emails;
    const user = await Ent_user.findOne({
      where: {
        [Op.or]: [{ UserName: UserName }, { Emails: Emails }],
      },
      attributes: [
        "ID_User",
        "UserName",
        "Permission",
        "ID_Duan",
        "Password",
        "ID_KhoiCV",
        "Emails",
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
          attributes: ["KhoiCV"],
        },
      ],
    });

    if (user !== null) {
      return res.status(401).json({
        message: "Tài khoản hoặc Email đã bị trùng.",
      });
    }

    const salt = genSaltSync(10);
    var data = {
      UserName: req.body.UserName,
      Emails: req.body.Emails,
      Password: await hashSync(req.body.Password, salt),
      Permission: req.body.Permission,
      ID_Duan: req.body.ID_Duan || null,
      ID_KhoiCV: req.body.Permission == 1 ? null : req.body.ID_KhoiCV,
      isDelete: 0,
    };

    Ent_user.create(data)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({
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
      return res.status(400).json({
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
          res.status(200).json({
            message: "Cập nhật mật khẩu thành công!",
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

// Update user
exports.updateUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
    }

    const userData = req.user.data;
    if (!userData) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    const { ID_Duan, Permission, ID_KhoiCV, UserName, Emails, Password } =
      req.body;

    // Kiểm tra xem có dữ liệu mật khẩu được gửi không
    let updateData = {
      ID_Duan,
      Permission,
      ID_KhoiCV: Permission == 1 ? null : ID_KhoiCV,
      UserName,
      Emails,
      isDelete: 0,
    };

    if (Password) {
      const hashedNewPassword = await hashSync(Password, 10);
      updateData.Password = hashedNewPassword;
    }

    await Ent_user.update(updateData, {
      where: {
        ID_User: req.params.id,
      },
    });

    return res.status(200).json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};

// Get All User
exports.deleteUser = async (req, res, next) => {
  try {
    const userData = req.user.data;
    if (userData) {
      await Ent_user.update(
        {
          isDelete: 1,
        },
        {
          where: {
            ID_User: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
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
    let whereClause = {
      isDelete: 0,
    };

    if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
      whereClause.ID_Duan = userData.ID_Duan;
    }

    await Ent_user.findAll({
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
      include: [
        {
          model: Ent_duan,
          attributes: ["Duan", "Diachi"],
        },
        {
          model: Ent_chucvu,
          attributes: ["Chucvu"],
        },
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV"],
        },
      ],
      where: whereClause,
      order: [
        ["ID_Duan", "ASC"],
        ["Permission", "ASC"],
      ],
    })
      .then((data) => {
        res.status(200).json({
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

exports.getDetail = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData) {
      let whereClause = {
        isDelete: 0,
      };

      if (userData.Permission !== 3 || userData.ent_chucvu.Chucvu !== "PSH") {
        whereClause.ID_Duan = userData.ID_Duan;
      }

      await Ent_user.findByPk(req.params.id, {
        attributes: [
          "ID_User",
          "UserName",
          "Emails",
          "ID_Khuvucs",
          "Password",
          "ID_Duan",
          "ID_KhoiCV",
          "Permission",
        ],
        order: [
          ["ID_Duan", "ASC"],
          ["Permission", "ASC"],
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan", "Diachi"],
          },
          {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Thông tin User!",
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

//get Check auth
exports.checkAuth = async (req, res, next) => {
  try {
    const userData = req.user.data;
    await Ent_user.findByPk(userData.ID_User, {
      attributes: [
        "ID_User",
        "UserName",
        "Emails",
        "Password",
        "ID_Khuvucs",
        "ID_Duan",
        "ID_KhoiCV",
        "Permission",
      ],
      include: [
        {
          model: Ent_duan,
          attributes: ["Duan", "Diachi"],
        },
        {
          model: Ent_chucvu,
          attributes: ["Chucvu"],
        },
        {
          model: Ent_khoicv,
          attributes: ["KhoiCV"],
        },
      ],
      where: {
        isDelete: 0,
      },
    })
      .then((data) => {
        res.status(200).json({
          message: "Thông tin User!",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// get account checklist giam sat by du an
exports.getGiamSat = async (req, res, next) => {
  try {
    const userData = req.user.data;
    if (userData && userData.Permission === 1) {
      const whereCondition = {
        isDelete: 0,
        Permission: 2,
        ID_Duan: userData.ID_Duan,
      };
      await Ent_user.findAll({
        attributes: [
          "ID_User",
          "UserName",
          "Emails",
          "ID_Khuvucs",
          "Password",
          "ID_Duan",
          "ID_KhoiCV",
          "Permission",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan", "Diachi"],
          },
          {
            model: Ent_chucvu,
            attributes: ["Chucvu"],
          },
          {
            model: Ent_khoicv,
            attributes: ["KhoiCV"],
          },
        ],
        where: whereCondition,
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách nhân viên!",
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

exports.devuceToken = async (req, res, next) => {
  
}

exports.setUpKhuVuc = async (req, res, next) => {
  try {
    const userData = req.user.data;
    const ID_User = req.params.id;

    const data = req.body;
    const checkedIDs = extractCheckedIDs(data);

    if (userData) {
      await Ent_user.update(
        {
          ID_Khuvucs: checkedIDs,
        },
        {
          where: {
            ID_User: ID_User,
          },
        }
      );
    }
    return res.status(200).json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const extractCheckedIDs = (data) => {
  return data.flatMap(
    (buildingAreas) =>
      buildingAreas
        .filter((area) => area.checked) // Filter areas with checked === true
        .map((area) => area.ID_Khuvuc) // Map to ID_Khuvuc
  );
};
