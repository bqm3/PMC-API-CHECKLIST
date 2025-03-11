const nodemailer = require("nodemailer");
const moment = require("moment-timezone");
const { S0_Thaydoithe, S0_Thaydoithe_log } = require("../models/setup.model");
const sequelize = require("../config/db.config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to create log
const createLog = async (transaction, action, data) => {
  try {
    await S0_Thaydoithe_log.create(
      {
        ID_Thaydoithe: data.ID_Thaydoithe,
        ID_Duan: data.ID_Duan,
        ID_User: data.ID_User,
        ngaytd: data.ngaytd,
        sltheoto: data.sltheoto,
        slthexemay: data.slthexemay,
        lydothaydoi: data.lydothaydoi,
        isDelete: data.isDelete,
        action: action,
      },
      { transaction }
    );
  } catch (error) {
    console.error("Error creating log:", error.message);
  }
};

// Create new record with transaction
const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const Ngaytd = moment(new Date()).format("YYYY-MM-DD");
    const { data } = req.body;

    const newRecord = await S0_Thaydoithe.create(
      {
        ID_Duan: userData.ID_Duan,
        ID_User: userData.ID_User,
        ngaytd: Ngaytd,
        sltheoto: data.sltheoto || 0,
        slthexemay: data.slthexemay || 0,
        isDelete: 0,
      },
      { transaction }
    );

    await createLog(transaction, "CREATE", newRecord);
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Thêm mới thành công",
      data: newRecord,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra.",
    });
  }
};

// Get all records
const getAll = async (req, res) => {
  try {
    const { ID_Duan } = req.query;

    const conditions = {
      isDelete: 0,
    };

    if (ID_Duan) {
      conditions.ID_Duan = ID_Duan;
    }

    const records = await S0_Thaydoithe.findAll({
      where: conditions,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra.",
    });
  }
};

// Get record by ID
const getById_Duan = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await S0_Thaydoithe.findOne({
      where: {
        ID_Duan: id,
        isDelete: 0,
      },
    });

    if (!record) {
      const attributes = Object.keys(S0_Thaydoithe.rawAttributes);
      const emptyRecord = {};

      // Set each field to 0
      attributes.forEach((attr) => {
        emptyRecord[attr] = 0;
      });

      return res.status(200).json({
        success: true,
        data: emptyRecord,
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra.",
    });
  }
};

// Update record with transaction
const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { data, dataOld } = req.body;
    const userData = req.user.data;

    const ngaytd = moment().format("YYYY-MM-DD");

    const updateData = {
      ID_User: userData.ID_User,
      ngaytd,
      sltheoto: data.sltheoto || 0,
      slthexemay: data.slthexemay || 0,
      lydothaydoi: data.lydothaydoi || "",
    };

    // Tìm và cập nhật bản ghi nếu tồn tại, nếu không thì tạo mới
    const [record, created] = await S0_Thaydoithe.findOrCreate({
      where: {
        ID_Duan: userData.ID_Duan,
        isDelete: 0,
      },
      defaults: {
        ID_Duan: userData.ID_Duan,
        ...updateData,
        isDelete: 0,
      },
      transaction,
    });

    if (!created) {
      await record.update(updateData, { transaction });
      await createLog(transaction, "UPDATE", record);
      await sendEmail(record, userData, "UPDATE", dataOld);
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: record,
      });
    }

    await createLog(transaction, "CREATE", record);
    await sendEmail(record, userData, "CREATE");
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Thêm mới thành công",
      data: record,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi:", error);
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra.",
    });
  }
};

// Soft delete record with transaction
const remove = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const record = await S0_Thaydoithe.findOne({
      where: {
        ID_Thaydoithe: id,
        isDelete: 0,
      },
    });

    if (!record) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu",
      });
    }

    await record.update(
      {
        isDelete: 1,
      },
      { transaction }
    );

    await createLog(transaction, "DELETE", record);
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Xóa thành công",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra.",
    });
  }
};

const sendEmail = async (data, userData, action, dataOld) => {
  let subject = "";
  let content = "";
  let to 
  if(userData?.ID_Duan == 1) {
    to = "manhdz22pl@gmail.com";
  } else { 
    to = "om_department@pmcweb.vn";
    // to = "manhnd2903@gmail.com";
  }
  const currentDate = moment().format("DD/MM/YYYY");

  switch (action) {
    case "CREATE":
      subject = "Báo cáo số lượng thẻ ô tô và xe máy đầu kỳ";
      content = `
        <p style="margin-bottom: 16px;">Kính gửi: Ban Tổng giám đốc,</p>
        <p>Dự án: <strong>${userData?.ent_duan?.Duan}</strong> (Giám đốc dự án: <strong>${userData?.Hoten}</strong>) báo cáo với Ban Tổng giám đốc số lượng thẻ ô tô 
        và xe máy dành cho khách vãng lai.</p>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>Số lượng thẻ ô tô phát hành: <strong>${data.sltheoto}</strong> thẻ</li>
          <li>Số lượng thẻ xe máy phát hành: <strong>${data.slthexemay}</strong> thẻ</li>
        </ul>
        <p style="margin-top: 16px;">Ngày: <strong>${currentDate}</strong><br>
        Người báo cáo: <strong>${userData?.Hoten}</strong></p>
      `;
      break;

    case "UPDATE":
      const otoDiff = data.sltheoto - (dataOld?.sotheotodk || 0);
      const xemayDiff = data.slthexemay - (dataOld?.sothexemaydk || 0);

      const getChangeText = (diff) =>
        diff === 0
          ? '<span style="color: #6c757d;">(không thay đổi)</span>'
          : diff > 0
          ? `<span style="color: #28a745;"> ▲ Tăng ${diff} thẻ</span>`
          : `<span style="color: #dc3545;"> ▼ Giảm ${Math.abs(diff)} thẻ</span>`;

      subject = "Cập nhật số lượng thẻ ô tô và xe máy";
      content = `
        <p>Kính gửi: Ban Tổng giám đốc,</p>
        <p>Dự án: <strong>${userData?.ent_duan?.Duan}</strong> (Giám đốc dự án: <strong>${userData?.Hoten}</strong>) đã cập nhật số lượng thẻ.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f1f3f5;">
            <th style="padding: 10px; border: 1px solid #dee2e6;">Loại thẻ</th>
            <th style="padding: 10px; border: 1px solid #dee2e6;">Giá trị cũ</th>
            <th style="padding: 10px; border: 1px solid #dee2e6;">Giá trị mới</th>
            <th style="padding: 10px; border: 1px solid #dee2e6;">Thay đổi</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #dee2e6;">Thẻ ô tô</td>
            <td style="text-align: center;">${dataOld?.sotheotodk || 0} thẻ</td>
            <td style="text-align: center;">${data.sltheoto} thẻ</td>
            <td style="text-align: center;">${getChangeText(otoDiff)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #dee2e6;">Thẻ xe máy</td>
            <td style="text-align: center;">${dataOld?.sothexemaydk || 0} thẻ</td>
            <td style="text-align: center;">${data.slthexemay} thẻ</td>
            <td style="text-align: center;">${getChangeText(xemayDiff)}</td>
          </tr>
        </table>
        <p><strong>Lý do:</strong> ${data?.lydothaydoi}</p>
        <p>Ngày: <strong>${currentDate}</strong><br>Người báo cáo: <strong>${userData?.Hoten}</strong></p>
      `;
      break;

    default:
      subject = "Thông báo hệ thống";
      content = "<p>Không có hành động cụ thể.</p>";
  }

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e9ecef;">
      <div style="text-align: center; padding: 20px; background-color: #007bff; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">${subject}</h2>
      </div>
      <div style="padding: 20px;">${content}</div>
      <div style="text-align: center; background: #f8f9fa; padding: 20px; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Phòng Số Hóa - PMC. <br> Mọi quyền được bảo lưu.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};


module.exports = {
  create,
  getAll,
  getById_Duan,
  update,
  remove,
};
