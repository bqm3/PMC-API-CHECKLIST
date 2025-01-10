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
const ExcelJS = require("exceljs");
const sequelize = require("../config/db.config");
const xlsx = require("xlsx");

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
      attributes: ["ID_User", "UserName", "Email", "Password", "isDelete"],
    });

    if (!userDetail) {
      return res
        .status(400)
        .json({ message: "Tài khoản không tồn tại hoặc email không đúng." });
    }

    // Tạo mật khẩu 6 chữ số ngẫu nhiên
    const randomPassword = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

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

exports.sendMailBaocao = async (req, res) => {
  try {
    // Lấy dữ liệu báo cáo
    const results = await sequelize.query(`
      SELECT
        \`ID_Duan\`, \`duan\`,
        \`TenHangmuc\`,
        \`thang1\`, \`thang2\`, \`thang3\`, \`thang4\`,
        \`thang5\`, \`thang6\`, \`thang7\`, \`thang8\`,
        \`thang9\`, \`thang10\`, \`thang11\`, \`thang12\`
      FROM \`Baocaothnam\`
      WHERE \`Nam\` = 2024
      ORDER BY ID_Duan ASC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    const uniqueIdDuanList = [...new Set(results.map((row) => row.ID_Duan))].join(',');

    // Lấy danh sách email theo ID dự án
    const arrMail = await sequelize.query(`
      SELECT ID_Duan, Email
      FROM tb_mail_duan
      WHERE ID_Duan IN (${uniqueIdDuanList})
        AND LOWER(Email) NOT LIKE '%f@%'
        ORDER BY ID_Duan ASC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    const arrMail2 = await sequelize.query(`
      SELECT ID_Duan, Email 
      FROM ent_user 
      WHERE ID_Duan IN (${uniqueIdDuanList})
        AND ID_Chucvu = 2
        AND isDelete = 0
        ORDER BY ID_Duan ASC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    const existingIds = new Set(arrMail.map((item) => item.ID_Duan));

    // Lọc arrMail2 để chỉ lấy những email có ID_Duan chưa xuất hiện trong arrMail
    const filteredArrMail2 = arrMail2.filter((item) => !existingIds.has(item.ID_Duan));

    // Hợp nhất hai danh sách
    const mergedMailList = [...arrMail, ...filteredArrMail2];
    mergedMailList.sort((a, b) => a.ID_Duan - b.ID_Duan);

    const testMailList = mergedMailList.filter(mail => [2, 5, 9, 10].includes(mail.ID_Duan));

    

    //    AND Email IS NOT NULL
    
    // Nhóm dữ liệu theo ID dự án
    const groupedData = results.reduce((acc, row) => {
      const ID_Duan = row.ID_Duan;
      if (!acc[ID_Duan]) {
        acc[ID_Duan] = [];
      }
      acc[ID_Duan].push(row);
      return acc;
    }, {});

    // Gửi email cho từng địa chỉ email theo ID dự án
    for (const emailData of testMailList) {
      const duanData = groupedData[emailData.ID_Duan];
      
      if (duanData) {
        // Tạo workbook mới cho mỗi dự án
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(duanData[0].duan);

        // Thiết lập cột cho worksheet
        worksheet.columns = [
          { header: "Tên hạng mục", key: "TenHangmuc", width: 30 },
          { header: "Tháng 1", key: "thang1", width: 15 },
          { header: "Tháng 2", key: "thang2", width: 15 },
          { header: "Tháng 3", key: "thang3", width: 15 },
          { header: "Tháng 4", key: "thang4", width: 15 },
          { header: "Tháng 5", key: "thang5", width: 15 },
          { header: "Tháng 6", key: "thang6", width: 15 },
          { header: "Tháng 7", key: "thang7", width: 15 },
          { header: "Tháng 8", key: "thang8", width: 15 },
          { header: "Tháng 9", key: "thang9", width: 15 },
          { header: "Tháng 10", key: "thang10", width: 15 },
          { header: "Tháng 11", key: "thang11", width: 15 },
          { header: "Tháng 12", key: "thang12", width: 15 },
        ];

        // Thêm dữ liệu vào worksheet
        duanData.forEach((row) => {
          worksheet.addRow(row);
        });

        // Tạo buffer cho file Excel
        const buffer = await workbook.xlsx.writeBuffer();

        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: emailData.Email,
          subject: `[Báo cáo] Thống kê sự cố ngoài năm 2024 - Dự án ${duanData[0].duan}`,
          text: `Kính gửi anh/chị,

    Đính kèm email này là file báo cáo thống kê sự cố ngoài năm 2024 cho dự án ${duanData[0].duan}. Báo cáo bao gồm thông tin chi tiết về các hạng mục liên quan trong suốt 12 tháng.
    Nếu có bất kỳ câu hỏi hoặc yêu cầu bổ sung, xin vui lòng liên hệ lại.

    Trân trọng,
    Phòng số hóa`,
          attachments: [
            {
              filename: `ThongKeBaoCao2024_${duanData[0].duan}.xlsx`,
              content: buffer,
              contentType: 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        };

        await transporter.sendMail(mailOptions);
      }
    }

    res.status(200).json({ message: "Email đã được gửi thành công!" , data : testMailList});
  } catch (error) {
    console.error("Lỗi truy vấn: " + error.stack);
    res.status(500).json({ error: "Có lỗi xảy ra khi gửi email" });
  }
};

exports.uploadMail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const emailProjectData = [];

    let lastMainProject = null;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length >= 3) {
        // Get full project name including sub-category
        const currentMainProject = row[0]?.split(" (")[0].trim();
        if (currentMainProject) {
          lastMainProject = currentMainProject;
        }

        const mainProject = currentMainProject || lastMainProject;
        const subCategory = row[1]?.trim(); // Get the sub-category name
        const projectName = `${mainProject}`; // Combine them
        const ten = `${subCategory}`;
        const email = row[2]?.trim();

        // Check for valid email and project name
        if (email && projectName) {
          // For multiple emails in one cell, split and add each
          const emails = email.split(/[,;\s]+/); // Split by comma, semicolon, or whitespace

          for (const singleEmail of emails) {
            if (singleEmail && singleEmail.includes("@")) {
              emailProjectData.push({
                Tenduan: projectName,
                Ten: ten,
                Email: singleEmail.trim(),
              });
            }
          }
        }
      }
    }

    const promises = emailProjectData.map(async (item) => {
      const query =
        "INSERT INTO tb_mail_duan (Tenduan, Ten, Email, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())";

      console.log("Inserting:", item.Tenduan, item.Ten, item.Email);

      if (item.Tenduan && item.Email) {
        return sequelize.query(query, {
          replacements: [item.Tenduan, item.Ten, item.Email],
        });
      } else {
        console.warn("Skipping item due to missing values:", item);
      }
    });

    await Promise.all(promises);
    res.status(200).json({
      message: "Data uploaded successfully",
      count: emailProjectData.length,
    });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Error uploading data", error });
  }
};
