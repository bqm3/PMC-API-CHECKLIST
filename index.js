require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const PDFDocument = require("pdfkit");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const mysqldump = require("mysqldump");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const app = express();

var serviceAccount = require("./pmc-cskh-firebase-adminsdk-y7378-5122f6edc7.json");

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
// This registration token comes from the client FCM SDKs.
app.get("/test-noti", async (req, res) => {
  const registrationTokens = [
    "ExponentPushToken[CzoGcLH9L4wqJGVB9V-68-]",
    "ExponentPushToken[0eplaPHQHUcrFvaEm24iMe]",
  ];

  const message = {
    notification: {
      title: "Hello World 2",
      body: "Test Body 2",
    },
    tokens: registrationTokens,
  };

  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      res.json({ response });
      console.log(response.successCount + " messages were sent successfully");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/generate-pdf", (req, res) => {
  const doc = new PDFDocument();

  // Set the response type to PDF
  res.setHeader("Content-Type", "application/pdf");

  // Pipe the PDF into the response
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text("Hello World!", 100, 100);
  doc.text("This is a sample PDF generated on the server.");

  // Finalize the PDF and end the stream
  doc.end();
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

  console.log(`Database exported to: ${backupPath}`);
  return backupPath;
}

// Hàm upload file lên Google Drive
async function uploadFile(filePath) {
  try {
    // ID của thư mục trên Google Drive
    const folderId = "1TAMvnXHdhkTov68oKrLbB6DE0bVZezAL"; 

    const createFile = await drive.files.create({
      requestBody: {
        name: path.basename(filePath), 
        mimeType: "application/sql", 
        parents: [folderId], 
      },
      media: {
        mimeType: "application/sql",
        body: fs.createReadStream(filePath),
      },
    });

    const fileId = createFile.data.id;
    console.log(`File uploaded with ID: ${fileId}`);

    // Đặt quyền cho file
    const getUrl = await setFilePublic(fileId);
    console.log(getUrl.data);
  } catch (error) {
    console.error(error);
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

    const getUrl = await drive.files.get({
      fileId,
      fields: "webViewLink, webContentLink",
    });

    return getUrl;
  } catch (error) {
    console.error(error);
  }
}

// Hàm thực hiện toàn bộ quá trình
async function handleBackup() {
  try {
    const backupFilePath = await exportDatabase(); // Xuất cơ sở dữ liệu
    await uploadFile(backupFilePath); // Upload file lên Google Drive
  } catch (error) {
    console.error(error);
  }
}

cron.schedule("0 4 * * *", async () => {
  console.log("Running Cron Job at 4 AM");
  try {
    // Gọi hàm main của bạn
    await handleBackup();
    console.log("Cron job completed successfully");
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});


require("./app/routes/ent_calv.route")(app);
require("./app/routes/ent_user.route")(app);
require("./app/routes/ent_tang.route")(app);
require("./app/routes/ent_toanha.route")(app);
require("./app/routes/ent_khuvuc.route")(app);
require("./app/routes/ent_thietlapca.route")(app);
require("./app/routes/ent_duan.route")(app);
require("./app/routes/ent_hangmuc.route")(app);
require("./app/routes/ent_khoicv.route")(app);
require("./app/routes/ent_checklist.route")(app);
require("./app/routes/ent_chucvu.route")(app);
require("./app/routes/tb_checklistc.route")(app);
require("./app/routes/tb_checklistchitiet.route")(app);
require("./app/routes/tb_checklistchitietdone.route")(app);
require("./app/routes/ent_duan_khoicv.route")(app);
require("./app/routes/tb_sucongoai.route")(app);
require("./app/routes/mail.route")(app);
require("./app/routes/noti.route")(app);

const PORT = process.env.PORT || 6868;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
