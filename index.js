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
const { Readable } = require('stream');
const app = express();
const { exec } = require("child_process");
var serviceAccount = require("./pmc-cskh-2088353edcc9.json");
const sequelize = require("./app/config/db.config");
const { Sequelize, Op } = require("sequelize");
const { funcAutoNoti, funcAllNoti } = require("./noti");
// const { processBackgroundTask, processBackgroundTaskDone } = require("./app/queue/consumer.checklist");
// const { initRabbitMQ } = require("./app/queue/producer.checklist");
// const { createDynamicTableDone, createDynamicTableChiTiet } = require("./app/utils/util");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");


// (async () => {
//   try {
//     await initRabbitMQ(); // Khởi tạo kết nối RabbitMQ
//     processBackgroundTask(); // Bắt đầu lắng nghe các tác vụ từ queue
//     processBackgroundTaskDone()
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
  universe_domain: process.env.UNIVERSE_DOMAIN
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
    "http://192.168.1.16:3000",
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

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Nếu dùng body-parser
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("app/public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  req.on('aborted', () => {
      console.error('⚠️ Request bị hủy (middleware)');
      req.destroyed = true;
  });
  next();
});

app.get("/", (req, res) => {
  res.json("Hello World!");
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
require("./app/routes/s0_thaydoithe.routes")(app);
require("./app/routes/ent_thamsophanhe.routes")(app);
require("./app/routes/tb_user_history.routes")(app);

const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`📝 Original Source By: ${process.env.AUTHOR}`);
  console.log(`📝 Modified Into JavaScript By: ${process.env.AUTHOR}`);
  console.log(`Server is running on port ${PORT}.`);
});
