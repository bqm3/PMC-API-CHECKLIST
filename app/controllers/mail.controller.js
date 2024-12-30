const nodemailer = require("nodemailer");
const moment = require("moment");
const {
  Ent_duan,
  Ent_chucvu,
  Ent_khuvuc,
  Ent_hangmuc,
  Ent_user,
  Ent_toanha,
  Tb_sucongoai,
} = require("../models/setup.model");
const { Op } = require("sequelize");

const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.main = async (req, res) => {
  try {
    const dateFix = () => {
      let d = new Date();
      d.setDate(d.getDate() - 3);
      return d;
    };
    const dateFormat = dateFix().toISOString().split("T")[0];

    const whereList = {
      isDelete: 0,
      Ngaysuco: {
        [Op.lte]: dateFormat,
      },
      Tinhtrangxuly: 0,
    };

    const dataSuCoNgoai = await Tb_sucongoai.findAll({
      attributes: [
        "ID_Suco",
        "ID_Hangmuc",
        "ID_User",
        "Ngaysuco",
        "Giosuco",
        "Noidungsuco",
        "Tinhtrangxuly",
        "Ngayxuly",
        "isDelete",
        "Duongdancacanh",
      ],
      include: [
        {
          model: Ent_hangmuc,
          attributes: [
            "Hangmuc",
            "Tieuchuankt",
            "ID_Khuvuc",
            "MaQrCode",
            "FileTieuChuan",
            "isDelete",
          ],
          include: [
            {
              model: Ent_khuvuc,
              attributes: ["Tenkhuvuc", "MaQrCode", "Makhuvuc", "Sothutu"],
              include: [
                {
                  model: Ent_toanha,
                  attributes: ["Toanha", "ID_Duan"],
                  include: [
                    {
                      model: Ent_duan,
                      attributes: ["Duan"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Ent_user,
          include: {
            model: Ent_chucvu,
            attributes: ["Chucvu", "Role"],
          },
          attributes: ["UserName", "Email", "Hoten"],
        },
      ],
      where: whereList,
    });

    const dataUser = await Ent_user.findAll({
      attributes: [
        "ID_Duan",
        "Email",
        "Hoten",
        "UserName",
        "ID_Chucvu",
        "isDelete",
      ],
      include: [
        {
          model: Ent_duan,
          attributes: ["Duan", "Diachi", "Logo"],
        },
        {
          model: Ent_chucvu,
          attributes: ["Chucvu", "Role"],
        },
      ],
      where: {
        isDelete: 0,
        ID_Chucvu: {
          [Op.in]: [2, 3],
        },
      },
    });

    const incidentsByProject = {};
    dataSuCoNgoai.forEach((incident) => {
      const projectId = incident.ent_hangmuc.ent_khuvuc.ent_toanha.ID_Duan;
      if (!incidentsByProject[projectId]) {
        incidentsByProject[projectId] = [];
      }
      incidentsByProject[projectId].push(incident);
    });

    for (const projectId in incidentsByProject) {
      const recipients = dataUser
        .filter((user) => user.ID_Duan === parseInt(projectId))
        .map((user) => user.Email);

      if (recipients.length > 0) {
        const projectIncidents = incidentsByProject[projectId]
          .map((incident, index) => {
            // Handle image URLs
            const imageLinks = incident.Duongdancacanh
              ? `<div style="display: flex; flex-wrap: wrap; gap: 20px;">` +
                incident.Duongdancacanh.split(",")
                  .map((key) => {
                    const imageUrl = `https://lh3.googleusercontent.com/d/${key}=s1000?authuser=0`;
                    return `<a href="${imageUrl}" target="_blank">
                  <img src="${imageUrl}" alt="Incident Image" style="max-width: 200px; margin-right: 20px" />
                </a>`;
                  })
                  .join("") +
                `</div>`
              : "No images available";

            return `
              <div>
                <h3>Sự cố thứ: ${index + 1}</h3>
                <p>Khu vực: ${incident.ent_hangmuc.ent_khuvuc.Tenkhuvuc}</p>
                <p>Hạng mục: ${incident.ent_hangmuc.Hangmuc}</p>
                <p>Người gửi sự cố: ${incident.ent_user.Hoten}</p>
                <p>Ngày báo cáo: ${incident.Ngaysuco}</p>
                <p>Nội dung: ${incident.Noidungsuco}</p>
                <p>Hình ảnh: ${imageLinks}</p>
                <p>Tình trạng: Chưa xử lý</p>
              </div>`;
          })
          .join("");

        const info = await transporter.sendMail({
          from: "PMC Checklist thông báo sự cố <phongsohoa.pmc57@gmail.com>",
          to: recipients.join(","),
          subject: `Báo cáo sự cố ngoài cho dự án`,
          html: `<div>${projectIncidents}</div>`,
        });
      }
    }

    res.status(200).json({
      message: "Đã gửi báo cáo sự cố cho các dự án",
      dataSuco: dataSuCoNgoai,
      dataUser: dataUser,
    });
  } catch (error) {
    console.error("Error while sending emails:", error);
    res.status(500).json({ message: "Lỗi trong quá trình gửi email", error });
  }
};

exports.ressetPassword = async (req, res) => {
  try {
    const { Email, UserName } = req.body;

    // Tìm thông tin người dùng
    const userDetail = await Ent_user.findOne({
      where: {
        UserName: UserName.trim(),
        isDelete: 0,
      },
      attributes: [
        "ID_User",
        "UserName",
        "Email",
        "Password",
        "isDelete",
      ],
    });

    if (!userDetail) {
      return res
        .status(400)
        .json({ message: "Tài khoản không tồn tại hoặc email không đúng." });
    }

    // Tạo mật khẩu 6 chữ số ngẫu nhiên
    const randomPassword = Math.floor(100000 + Math.random() * 900000).toString();

    // Mã hóa mật khẩu bằng bcrypt
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Cập nhật mật khẩu vào cơ sở dữ liệu
    await Ent_user.update(
      { Password: hashedPassword },
      {
        where: { ID_User: userDetail.ID_User },
      }
    );
   
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: Email,
      subject: "Reset mật khẩu của bạn",
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mật khẩu mới</title>
      <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .email-header {
      background-color: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
    }
    .email-body p {
      line-height: 1.6;
      margin: 10px 0;
    }
    .password {
      font-size: 20px;
      font-weight: bold;
      color: #007bff;
      background-color: #f0f8ff;
      padding: 10px;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }
    .email-footer {
      background-color: #f4f4f4;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #666666;
      border-top: 1px solid #e0e0e0;
    }
  </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Thông báo mật khẩu mới</h1>
        </div>
        <div class="email-body">
          <p style="font-size: 18px; font-weight: 600;">Phòng Số Hóa xin chào,</p>

          <p>Mật khẩu mới của bạn là:</p>
          <div class="password">${randomPassword}</div>
          <p>Mật khẩu này có hiệu lực trong <strong>30 phút</strong>. Vui lòng sử dụng nó để đăng nhập ngay bây giờ.</p>
          <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div class="email-footer">
          &copy; Phòng Số Hóa - PMC
        </div>
      </div>
    </body>
    </html>
  `,
    };

    await transporter.sendMail(mailOptions);

    // Đặt lịch xóa mật khẩu sau 30 phút nếu không đăng nhập
    setTimeout(async () => {
      const user = await Ent_user.findOne({
        where: {
          ID_User: userDetail.ID_User,
          updatedAt: { [Op.gte]: new Date(Date.now() - 30 * 60 * 1000) }, 
        },
      });

      if (user) {
        await Ent_user.update(
          { Password: null },
          { where: { ID_User: userDetail.ID_User } }
        );
        console.log("Password reset timeout. Password cleared.");
      }
    }, 30 * 60 * 1000); 

    return res
      .status(200)
      .json({ message: "Mật khẩu mới đã được gửi qua email của bạn." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi reset mật khẩu." });
  }
};
