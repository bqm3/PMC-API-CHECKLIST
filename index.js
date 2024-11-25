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
const app = express();

var serviceAccount = require("./pmc-cskh-firebase-adminsdk-y7378-5122f6edc7.json");
const { danhSachDuLieu, getProjectsChecklistStatus } = require("./app/controllers/nlr_ai.controller");

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

const folderId = "1TAMvnXHdhkTov68oKrLbB6DE0bVZezAL";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

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
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("app/public"));

app.get("/", (req, res) => {
  res.json("Hello World!");
});

async function exportDatabase() {
  const backupPath = path.join(
    __dirname,
    `backup_checklist_${new Date().toISOString().slice(0, 10)}.sql`
  );

  await mysqldump({
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    },
    dumpToFile: backupPath,
  });

  return backupPath;
}

// Hàm xóa file cũ trong thư mục Google Drive
async function deleteOldFiles(folderId) {
  try {
    const files = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name, createdTime)",
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const file of files.data.files) {
      if (new Date(file.createdTime) < oneWeekAgo) {
        await drive.files.delete({ fileId: file.id });
        console.log(`Deleted old file: ${file.name}`);
      }
    }
  } catch (error) {
    console.error("Error deleting old files:", error.response?.data || error.message);
  }
}

// Hàm upload file lên Google Drive
async function uploadFile(filePath) {
  try {
    const createFile = await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        mimeType: "text/plain",
        parents: [folderId],
      },
      media: {
        mimeType: "text/plain",
        body: fs.createReadStream(filePath),
      },
    });

    const fileId = createFile.data.id;
    console.log(`File uploaded with ID: ${fileId}`);

    const getUrl = await setFilePublic(fileId);
    console.log("File is publicly accessible at:", getUrl.data.webViewLink);
  } catch (error) {
    console.error("Error uploading file:", error.response?.data || error.message);
  }
}

// Hàm đặt quyền công khai cho file
async function setFilePublic(fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return await drive.files.get({
      fileId,
      fields: "webViewLink, webContentLink",
    });
  } catch (error) {
    console.error("Error setting file to public:", error.response?.data || error.message);
  }
}

// Hàm kiểm tra dung lượng Drive
async function checkDriveQuota() {
  try {
    const driveInfo = await drive.about.get({ fields: "storageQuota" });
    const { usage, limit } = driveInfo.data.storageQuota;

    console.log(`Drive usage: ${usage}/${limit || "unlimited"}`);
    if (limit && Number(usage) >= Number(limit)) {
      console.error("Drive quota exceeded. Skipping backup.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking Drive quota:", error.response?.data || error.message);
    return false;
  }
}

// Hàm thực hiện toàn bộ quá trình
async function handleBackup() {
  try {
    const quotaAvailable = await checkDriveQuota();
    if (!quotaAvailable) return;

    const backupFilePath = await exportDatabase(); // Xuất cơ sở dữ liệu
    await deleteOldFiles(folderId); // Xóa file cũ trước khi tải file mới
    await retry(async () => {
      await uploadFile(backupFilePath);
    }, {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
    });

    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath); // Xóa file backup
      console.log(`Backup file deleted: ${backupFilePath}`);
    }
  } catch (error) {
    console.error("Error during backup process:", error.response?.data || error.message);
  }
}

// Lên lịch chạy cron
const lockFilePath = path.join(__dirname, "cron_backup.lock");
cron.schedule("47 8 * * *", async () => {
  console.log("Starting Cron Job at 8:15 AM");

  // Kiểm tra file khóa
  if (fs.existsSync(lockFilePath)) {
    console.log("Cron job is already running. Skipping this instance.");
    return;
  }

  // Tạo file khóa
  fs.writeFileSync(lockFilePath, "LOCKED");
  console.log("Lock file created.");

  try {
    await handleBackup();
    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Error running cron job:", error.message);
  } finally {
    // Xóa file khóa
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
      console.log("Lock file removed.");
    }
  }
});

cron.schedule('0 5 * * *', async () => {
  try {
    console.log('Cron job started at 6 AM...');
    await danhSachDuLieu();
    console.log('Cron job finished successfully');
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});

cron.schedule('0 6 * * *', async () => {
  try {
    console.log('Cron job started at 5 AM...');
    await getProjectsChecklistStatus(); 
    console.log('Cron job finished successfully');
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});


require("./app/routes/ent_calv.routes")(app);
require("./app/routes/ent_user.routes")(app);
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

const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log("📝 Original Source By: Quang Minh");
  console.log("📝 Modified Into JavaScript By: Quang Minh");
  console.log(`Server is running on port ${PORT}.`);
});
