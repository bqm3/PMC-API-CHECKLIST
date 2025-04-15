const { Ent_bansuco, Ent_user } = require("../models/setup.model");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

exports.getAllBansuco = async (req, res) => {
  try {
    const data = await Ent_bansuco.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBansucoById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Ent_bansuco.findByPk(id);
    if (data) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy bản ghi." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBansuco = async (req, res) => {
  try {
    const newData = await Ent_bansuco.create(req.body);
    res.status(201).json({ success: true, data: newData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBansuco = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await Ent_bansuco.update(req.body, { where: { id } });
    if (updated) {
      const updatedData = await Ent_bansuco.findByPk(id);
      res.status(200).json({ success: true, data: updatedData });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy bản ghi để cập nhật." });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBansuco = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Ent_bansuco.update(
      {
        isDelete: 1,
      },
      { where: { id } }
    );
    if (deleted) {
      res.status(200).json({ success: true, message: "Xóa thành công." });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy bản ghi để xóa." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMail = async (data, userData) => {
  try {
    const bansucos = await Ent_bansuco.findAll({
      attributes: ["ma_nv", "email"],
      where: {
        [Op.or]: [
          { khoi: 'kt' },
          { khoi: null }
        ],
        isDelete: 0,
      },
    });

    const maNVs = bansucos.map((item) => item.ma_nv);

    const users = await Ent_user.findAll({
      attributes: ["UserName", "Email"],
      where: {
        UserName: {
          [Op.in]: maNVs,
        },
      },
    });

    const bansucoEmails = bansucos.filter((item) => item.email).map((item) => item.email);
    const userEmails = users.filter((user) => user.Email).map((user) => user.Email);
    const emailList = [...new Set([...bansucoEmails, ...userEmails])];

    const emailListTest = [
      'manhdz22pl@gmail.com',
      'manhnd2903@gmail.com',
      'minhvirgo.1309@gmail.com',
      'trungmkzxc12345@gmail.com'
    ]

    await contentMail(data, userData, emailList);
    return true;

    // Ở đây bạn có thể tiếp tục gửi mail đến danh sách emailList nếu cần
  } catch (error) {
    throw new Error(error.message);
  }
};

const contentMail = async (data, userData, emailList) => {
  const projectName = userData?.ent_duan?.Duan || "Không xác định";
  
  const formattedDate = data.Ngaysuco ? new Date(data.Ngaysuco).toLocaleDateString("vi-VN") : "Không xác định";
  const formattedTime = data.Giosuco || "Không xác định";
  
  const mucDo = parseInt(data.Mucdo);
  const mucDoText = mucDo === 1 ? "Nghiêm trọng" : mucDo === 0 ? "Bình thường" : "Không xác định";
  const mucDoColor = mucDo === 1 ? "#dc3545" : "#ffc107";
  
  // Determine processing status
  const tinhTrangMap = {
    0: "Chưa xử lý",
    1: "Đang xử lý",
    2: "Đã xử lý"
  };
  const tinhTrangText = tinhTrangMap[parseInt(data.Tinhtrangxuly)] || "Chưa xử lý";
  
  // Optional sections
  const bienPhapSection = data.Bienphapxuly ? `
    <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
      <h3 style="margin-top: 0;">Biện pháp xử lý:</h3>
      <p style="margin-bottom: 0;">${data.Bienphapxuly}</p>
    </div>` : '';
  
  const ghiChuSection = data.Ghichu ? `
    <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
      <h3 style="margin-top: 0;">Ghi chú:</h3>
      <p style="margin-bottom: 0;">${data.Ghichu}</p>
    </div>` : '';
  
  // Email subject
  const emailSubject = `[THÔNG BÁO] - SỰ CỐ MỚI - DỰ ÁN ${projectName}`;
  
  // Email template
  const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 5px solid #dc3545;">
      <h2 style="color: #dc3545; margin: 0;">Thông Báo Sự Cố Mới - Dự Án ${projectName}</h2>
    </div>
    
    <div style="margin-bottom: 20px;">
      <p style="margin-bottom: 5px;"><strong>Ngày sự cố:</strong> ${formattedDate}</p>
      <p style="margin-bottom: 5px;"><strong>Giờ sự cố:</strong> ${formattedTime}</p>
      <p style="margin-bottom: 5px;"><strong>Hạng mục:</strong> ${data.TenHangmuc || "Không xác định"}</p>
      <p style="margin-bottom: 5px;"><strong>Mức độ:</strong> <span style="color: ${mucDoColor}">${mucDoText}</span></p>
      <p style="margin-bottom: 5px;"><strong>Tình trạng xử lý:</strong> ${tinhTrangText}</p>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
      <h3 style="margin-top: 0;">Nội dung sự cố:</h3>
      <p style="margin-bottom: 0;">${data.Noidungsuco || "Không có mô tả"}</p>
    </div>
    
    ${bienPhapSection}
    ${ghiChuSection}
    
    <div style="font-size: 12px; color: #6c757d; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p>Email này được gửi tự động từ hệ thống quản lý sự cố. Vui lòng không trả lời email này.</p>
    </div>
  </div>`;

  // Configure email transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"Hệ thống checklist" <${process.env.MAIL_USER}>`,
    to: emailList.join(", "),
    subject: emailSubject,
    html: emailHTML,
  });

  return true;
};
