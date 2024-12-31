const sequelize  = require('../config/db.config'); // Import cấu hình Sequelize của bạn
const getIpAddress = (req) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
  // Loại bỏ tiền tố "::ffff:" nếu tồn tại
  return ipAddress.includes("::ffff:") ? ipAddress.split("::ffff:")[1] : ipAddress;
};

const logAction = async (req, res, next) => {
  try {
    const userId = req.user?.data?.ID_User || null; // Lấy ID người dùng nếu có
    const ipAddress = getIpAddress(req); // Lấy IP từ request
    const userAgent = req.headers['user-agent']; // Lấy User-Agent
    const action = req.method; // Hành động API (GET, POST, PUT,...)
    const endpoint = req.originalUrl; // Endpoint được gọi
    const requestBody = JSON.stringify(req.body); // Nội dung request

    // Phân tích User-Agent để lấy thông tin thiết bị
    const deviceInfo = userAgent;

    const logData = {
      userId,
      ipAddress,
      deviceInfo, // Thêm thông tin thiết bị
      action,
      endpoint,
      requestBody,
    };

    // Lưu vào cơ sở dữ liệu
    await sequelize.query(
      `
      INSERT INTO api_logs (user_id, ip_address, device_info, action, endpoint, request_body)
      VALUES (:userId, :ipAddress, :deviceInfo, :action, :endpoint, :requestBody)
      `,
      {
        replacements: {
          userId: logData.userId,
          ipAddress: logData.ipAddress,
          deviceInfo: logData.deviceInfo,
          action: logData.action,
          endpoint: logData.endpoint,
          requestBody: logData.requestBody,
        },
      }
    );

    next(); // Tiếp tục đến handler tiếp theo
  } catch (error) {
    console.error('Error saving log:', error);
    next();
  }

};

module.exports = logAction;
