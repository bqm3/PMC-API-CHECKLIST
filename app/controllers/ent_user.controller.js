const ent_user = require("../models/ent_user.model");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { Op } = require("sequelize");

// Login User
exports.login = async (req, res) => {
  try {
    if (!req.body.Username || !req.body.Password) {
      res.status(400).send({
        message: "User not found or Username and Password wrong!!",
      });
      return;
    }
    const user = await ent_user.findOne({
      where: {
        Username: req.body.Username,
      },
    });
    if (user) {
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
            expiresIn: "360d",
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          SameSite: "strict",
          expires: new Date(Number(new Date()) + 360 * 24 * 60 * 60 * 1000),
        }); //we add secure: true, when using https.

        return res.status(200).send({ token: token, user: user });
      } else {
        return res.status(400).json({ error: "Password Incorrect" });
      }
    }
  } catch (err) {
    return res.status(500).send({
      message: err ? err : "Internal Server Error",
    });
  }
};

// Create User

exports.register = async (req, res, next) => {
  try {
    if (
      !req.body.Username ||
      !req.body.Emails ||
      !req.body.Password ||
      !req.body.Permission ||
      !req.body.ID_Duan ||
      !req.body.ID_KhoiCV
    ) {
      return res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu",
      });
    }
    const Username = req.body.Username;
    const Emails = req.body.Emails;
    const user = await ent_user.findOne({
      where: {
        [Op.or]: [{ Username }, { Emails }],
      },
    });
    console.log("user", user);

    if (user !== null) {
      return res.status(400).json({
        message: "Tài khoản hoặc Email đã bị trùng",
      });
    }
    const salt = genSaltSync(10);
    var data = {
      Username: req.body.Username,
      Emails: req.body.Emails,
      Password: await hashSync(req.body.Password, salt),
      Permission: req.body.Permission,
      ID_Duan: req.body.ID_Duan,
      ID_KhoiCV: req.body.ID_KhoiCV,
      isDelete: 0,
    };

    console.log("data", data);

    ent_user.create(data)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating.",
      });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
    // console.log('err', err)
  }
};
