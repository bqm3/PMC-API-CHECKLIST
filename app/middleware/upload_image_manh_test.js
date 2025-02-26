const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { Worker } = require("worker_threads");
const { removeVietnameseTones } = require("../utils/util"); // Giả sử util có sẵn

// Hàm tạo upload handler chung
const createUploadHandler = (folderKey) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB mỗi file
  });

// Định nghĩa các handler upload
const uploadChecklist = createUploadHandler("checklist");
const uploadSuCongNgoai = createUploadHandler("sucongoai");
const uploadBaoCaoChiSo = createUploadHandler("baocaochiso");
const uploadLogo = createUploadHandler("logo");

// Mapping thư mục theo folderKey
const uploadFolderMap = {
  checklist: path.join(__dirname, "..", "public", "checklist"),
  sucongoai: path.join(__dirname, "..", "public", "sucongoai"),
  baocaochiso: path.join(__dirname, "..", "public", "baocaochiso"),
  logo: path.join(__dirname, "..", "public", "logo"),
};

// Hàm xử lý resize ảnh với Worker Threads
const resizeImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();

    const userData = req.user?.data || {};
    const body = req?.body || {};
    let duan = userData?.ent_duan?.Duan || body?.Duan || "default";
    const projectName = removeVietnameseTones(duan).replace(/[^a-zA-Z0-9-_]/g, "_");

    // Xác định thư mục dựa trên fieldname hoặc route
    const fieldName = req.files[0]?.fieldname || "images"; // Mặc định là 'images'
    const folderKey = fieldName.includes("sucongoai")
      ? "sucongoai"
      : fieldName.includes("baocaochiso")
      ? "baocaochiso"
      : fieldName.includes("logo")
      ? "logo"
      : "checklist";
    const uploadFolder = path.join(uploadFolderMap[folderKey], projectName);

    // Tạo thư mục nếu chưa tồn tại
    await fs.mkdir(uploadFolder, { recursive: true });

    const workers = [];
    for (const file of req.files) {
      const filename = `${userData?.ID_Duan || "unknown"}_${Date.now()}${path.extname(file.originalname)}`;
      const outputPath = path.join(uploadFolder, filename);

      const worker = new Worker(path.join(__dirname, "worker.js"), {
        workerData: { buffer: file.buffer, outputPath },
      });

      workers.push(
        new Promise((resolve, reject) => {
          worker.on("message", (msg) => {
            if (msg.status === "done") resolve({ fieldname: file.fieldname, fileId: { id: `${projectName}/${filename}` } });
            else reject(new Error(msg.error));
          });
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
          });
        })
      );
    }

    // Chờ tất cả worker hoàn thành
    req.uploadedFiles = await Promise.all(workers);
    next();
  } catch (err) {
    console.error("Error processing images:", err.message);
    res.status(500).json({ error: "Image processing failed" });
  }
};

module.exports = {
  uploadChecklist,
  uploadSuCongNgoai,
  uploadBaoCaoChiSo,
  uploadLogo,
  resizeImage,
};
