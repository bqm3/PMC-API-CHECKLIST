require("dotenv").config();
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const mysqldump = require("mysqldump");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const { Readable } = require("stream");
const app = express();
const { exec } = require("child_process");
var serviceAccount = require("./pmc-cskh-firebase-adminsdk-y7378-5122f6edc7.json");
const sequelize = require("./app/config/db.config");
const { Sequelize, Op } = require("sequelize");
const { funcAutoNoti, funcAllNoti } = require("./noti");
const {
  processBackgroundTask,
  processBackgroundTaskDone,
} = require("./app/queue/consumer.checklist");
const { initRabbitMQ } = require("./app/queue/producer.checklist");
const {
  createDynamicTableDone,
  createDynamicTableChiTiet,
} = require("./app/utils/util");

// (async () => {
//   try {
//     await initRabbitMQ(); // Khởi tạo kết nối RabbitMQ
//     processBackgroundTask(); // Bắt đầu lắng nghe các tác vụ từ queue
//     processBackgroundTaskDone();
//     console.log("Queue is ready.");
//   } catch (error) {
//     console.error("Failed to initialize RabbitMQ:", error);
//   }
// })();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const SCOPES = "https://www.googleapis.com/auth/drive";

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: SCOPES,
});

const drive = google.drive({
  version: "v3",
  auth: auth,
});

var corsOptions = {
  origin: [
    "*",
    "http://localhost:3000",
    "http://localhost:3636",
    "https://checklist.pmcweb.vn",
    "https://demo.pmcweb.vn",
    "https://qlts.pmcweb.vn",
  ],

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// Nếu dùng body-parser
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("app/public"));

app.get("/", (req, res) => {
  res.json("Hello World!");
});

// backup folder
if (process.env.BACKUP_ENV === "development") {
  async function exportDatabaseFromYesterday() {
    // Tính ngày hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    // Lấy tháng và năm hiện tại
    const month = (yesterday.getMonth() + 1).toString().padStart(2, "0"); // Tháng hiện tại (01-12)
    const year = yesterday.getFullYear(); // Năm hiện tại

    // Tạo tên các bảng động
    const dynamicTables = [
      "HSSE",
      "ent_checklist",
      "ent_khuvuc",
      "ent_hangmuc",
      "tb_checklistc",
      "tb_checklistchitietdone",
      "tb_checklistchitiet",
      `tb_checklistchitiet_${month}_${year}`,
      `tb_checklistchitietdone_${month}_${year}`,
    ];

    try {
      // Lấy dữ liệu từ các bảng
      const backupDir = path.join(__dirname, "backup");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }

      const sqlFilePath = path.join(
        backupDir,
        `backup_yesterday_${new Date().toISOString().slice(0, 10)}.sql`
      );

      let sqlData = "";

      for (const table of dynamicTables) {
        // Lấy dữ liệu từ mỗi bảng
        const results = await sequelize.query(
          `SELECT * FROM ${table} WHERE createdAt BETWEEN ? AND ?`,
          {
            replacements: [startOfDay, endOfDay],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (results.length > 0) {
          sqlData += `-- Data from table: ${table}\n`;
          results.forEach((row) => {
            const insertSQL = `INSERT INTO ${table} (${Object.keys(row).join(
              ", "
            )}) VALUES (${Object.values(row)
              .map((value) => `'${value}'`)
              .join(", ")});\n`;
            sqlData += insertSQL;
          });
          sqlData += `\n`;
        }
      }

      if (!sqlData) {
        console.log("Không có dữ liệu nào trong ngày hôm qua.");
        return;
      }

      // Tạo file SQL từ dữ liệu truy vấn
      fs.writeFileSync(sqlFilePath, sqlData);

      // Nén file SQL thành file ZIP
      const zipFilePath = sqlFilePath + ".zip";
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Đặt mức độ nén
      });

      archive.pipe(output);
      archive.file(sqlFilePath, { name: path.basename(sqlFilePath) });
      await archive.finalize();

      // Xóa file SQL gốc sau khi nén
      fs.unlinkSync(sqlFilePath);

      return zipFilePath;
    } catch (error) {
      console.error("Lỗi khi xuất dữ liệu:", error);
    }
  }

  // Lên lịch chạy hàng ngày lúc 12 giờ trưa
  cron.schedule("30 12 * * *", async () => {
    try {
      console.log("Đang xuất cơ sở dữ liệu...");
      const backupFile = await exportDatabaseFromYesterday();
      console.log(`Đã xuất thành công vào ${backupFile}`);
    } catch (error) {
      console.error("Lỗi khi xuất cơ sở dữ liệu:", error);
    }
  });
} else {
  console.log(
    "Backup chỉ chạy ở môi trường local. NODE_ENV hiện tại là:",
    process.env.NODE_ENV
  );
}

if (process.env.BACKUP_DRIVER === "development") {
  async function exportDatabaseFromYesterday() {
    // Tính ngày hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    // Lấy tháng và năm hiện tại
    const month = (yesterday.getMonth() + 1).toString().padStart(2, "0"); // Tháng hiện tại (01-12)
    const year = yesterday.getFullYear(); // Năm hiện tại

    // Tạo tên các bảng động
    const dynamicTables = [
      "HSSE",
      "ent_checklist",
      "ent_khuvuc",
      "ent_hangmuc",
      "tb_checklistc",
      "tb_checklistchitietdone",
      "tb_checklistchitiet",
      `tb_checklistchitiet_${month}_${year}`,
      `tb_checklistchitietdone_${month}_${year}`,
    ];

    try {
      // Lấy dữ liệu từ các bảng
      const backupDir = path.join(__dirname, "backup");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }

      const sqlFilePath = path.join(
        backupDir,
        `backup_yesterday_${new Date().toISOString().slice(0, 10)}.sql`
      );

      let sqlData = "";

      for (const table of dynamicTables) {
        const results = await sequelize.query(
          `SELECT * FROM ${table} WHERE createdAt BETWEEN ? AND ?`,
          {
            replacements: [startOfDay, endOfDay],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (results.length > 0) {
          sqlData += `-- Data from table: ${table}\n`;
          results.forEach((row) => {
            const insertSQL = `INSERT INTO ${table} (${Object.keys(row).join(
              ", "
            )}) VALUES (${Object.values(row)
              .map((value) => `'${value}'`)
              .join(", ")});\n`;
            sqlData += insertSQL;
          });
          sqlData += `\n`;
        }
      }

      if (!sqlData) {
        console.log("Không có dữ liệu nào trong ngày hôm qua.");
        return;
      }

      // Tạo file SQL từ dữ liệu truy vấn
      fs.writeFileSync(sqlFilePath, sqlData);

      // Nén file SQL thành file ZIP
      const zipFilePath = sqlFilePath + ".zip";
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Đặt mức độ nén
      });

      archive.pipe(output);
      archive.file(sqlFilePath, { name: path.basename(sqlFilePath) });
      await archive.finalize();

      // Xóa file SQL gốc sau khi nén
      fs.unlinkSync(sqlFilePath);

      return zipFilePath;
    } catch (error) {
      console.error("Lỗi khi xuất dữ liệu:", error);
    }
  }

  async function uploadFile(filePath) {
    try {
      const folderId = "1TAMvnXHdhkTov68oKrLbB6DE0bVZezAL"; // Thay bằng ID thư mục của bạn

      // Tạo stream từ file ZIP
      const fileStream = fs.createReadStream(filePath);

      // Tạo file và upload lên Google Drive
      const createFile = await drive.files.create({
        requestBody: {
          name: path.basename(filePath),
          mimeType: "application/zip", // Đặt loại MIME cho file zip
          parents: [folderId],
        },
        media: {
          mimeType: "application/zip",
          body: fileStream, // Dùng stream từ file
        },
      });

      const fileId = createFile.data.id;

      // Đặt quyền công khai cho file
      const getUrl = await setFilePublic(fileId);

      // Xóa file ZIP sau khi upload thành công
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  // Hàm đặt quyền công khai cho file trên Google Drive
  async function setFilePublic(fileId) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const getUrl = await drive.files.get({
        fileId,
        fields: "webViewLink, webContentLink",
      });

      return getUrl;
    } catch (error) {
      console.error("Error setting file permissions:", error);
    }
  }

  // Hàm thực hiện toàn bộ quá trình
  async function handleBackup() {
    try {
      const sqlData = await exportDatabaseFromYesterday(); // Xuất cơ sở dữ liệu
      if (sqlData) {
        await uploadFile(sqlData); // Upload file ZIP lên Google Drive
      }
    } catch (error) {
      console.error("Error during backup process:", error);
    }
  }

  // Lên lịch chạy hàng ngày lúc 4 AM
  cron.schedule("30 12 * * *", async () => {
    console.log("Running Cron Job at 4 AM");
    try {
      await handleBackup();
      console.log("Cron job completed successfully");
    } catch (error) {
      console.error("Error running cron job:", error);
    }
  });
} else {
  console.log(
    "Backup chỉ chạy ở môi trường development. NODE_ENV hiện tại là:",
    process.env.NODE_ENV
  );
}

if (process.env.BACKUP_NOTI === "development") {
  cron.schedule("30 11 * * *", async () => {
    try {
      await funcAutoNoti();
      console.log("Cron job completed successfully");
    } catch (error) {
      console.error("Error running cron job:", error);
    }
  });
} else {
  console.log(
    "Notification chỉ chạy ở môi trường development. NODE_ENV hiện tại là:",
    process.env.NODE_ENV
  );
}

cron.schedule("0 0 20 * *", async () => {
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const year = new Date().getFullYear();
  await createDynamicTableDone(`tb_checklistchitietdone_${month}_${year}`);
  await createDynamicTableChiTiet(`tb_checklistchitiet_${month}_${year}`);
});

// 📝 Ghi log lỗi vào file để debug sau này
const logErrorToFile = (message) => {
  const logPath = path.join(__dirname, "error.log");
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
};

// 🚨 Bắt lỗi không bắt được trong toàn bộ ứng dụng
process.on("uncaughtException", (err) => {
  console.error("❌ Lỗi không bắt được:", err);
  logErrorToFile(`Uncaught Exception: ${err.stack || err}`);
  process.exit(1); // Restart lại server bằng PM2
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Lỗi promise không xử lý:", promise, "Lý do:", reason);
  logErrorToFile(`Unhandled Rejection: ${reason}`);
  process.exit(1); // Restart lại server
});

// 🚨 Bắt lỗi request bị hủy trước khi xử lý xong
app.use((req, res, next) => {
  req.on("aborted", () => {
    console.error("⚠️ Request bị hủy trước khi hoàn tất!", req.method, req.url);
    logErrorToFile(`Request aborted: ${req.method} ${req.url}`);
  });
  next();
});

// 🚨 Bắt lỗi middleware không xử lý được
app.use((err, req, res, next) => {
  console.error("❌ Lỗi trong Express middleware:", err);
  logErrorToFile(`Express Middleware Error: ${err.stack || err}`);

  res.status(500).json({ error: "Có lỗi xảy ra, vui lòng thử lại sau!" });
});

// 🚨 Giới hạn bộ nhớ để tránh crash do Out of Memory
process.on("warning", (warning) => {
  console.warn("⚠️ Cảnh báo của Node.js:", warning);
  logErrorToFile(`Node Warning: ${warning.name} - ${warning.message}`);
});

// 🚨 Theo dõi tín hiệu hệ thống (có thể giúp tắt server an toàn)
process.on("SIGTERM", () => {
  console.log("🔻 Server đang dừng do nhận tín hiệu SIGTERM...");
  logErrorToFile("Server shutting down due to SIGTERM");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔻 Server đang dừng do nhận tín hiệu SIGINT...");
  logErrorToFile("Server shutting down due to SIGINT");
  process.exit(0);
});

require("./app/routes/ent_calv.routes")(app);
require("./app/routes/ent_user.routes")(app);
require("./app/routes/ent_hsse.routes")(app);
require("./app/routes/ent_tang.routes")(app);
require("./app/routes/ent_toanha.routes")(app);
require("./app/routes/ent_khuvuc.routes")(app);
require("./app/routes/ent_thietlapca.routes")(app);
require("./app/routes/ent_duan.routes")(app);
require("./app/routes/ent_hangmuc.routes")(app);
require("./app/routes/ent_khoicv.routes")(app);
require("./app/routes/ent_checklist.routes")(app);
require("./app/routes/ent_chucvu.routes")(app);
require("./app/routes/tb_checklistc.routes")(app);
require("./app/routes/tb_checklistchitiet.routes")(app);
require("./app/routes/tb_checklistchitietdone.routes")(app);
require("./app/routes/ent_duan_khoicv.routes")(app);
require("./app/routes/tb_sucongoai.routes")(app);
require("./app/routes/mail.routes")(app);
require("./app/routes/noti.routes")(app);
require("./app/routes/ent_all.routes")(app);
require("./app/routes/ai.routes")(app);
require("./app/routes/sql.routes")(app);
require("./app/routes/get_image.routes")(app);
require("./app/routes/ent_baocaochiso.routes")(app);
require("./app/routes/p0.routes")(app);
require("./app/routes/beboi.routes")(app);
require("./app/routes/s0_thaydoithe.routes")(app);
require("./app/routes/ent_thamsophanhe.routes")(app);
require("./app/routes/tb_user_history.routes")(app);
require("./app/routes/ent_bansuco.routes")(app);
require("./app/routes/ent_tailieuphanhe.routes")(app);
require("./app/routes/ent_phanhe.routes")(app);
require("./app/routes/lb_yeucau_kh.routes")(app);

const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`📝 Original Source By: ${process.env.AUTHOR}`);
  console.log(`📝 Modified Into JavaScript By: ${process.env.AUTHOR}`);
  console.log(`Server is running on port ${PORT}.`);
});
