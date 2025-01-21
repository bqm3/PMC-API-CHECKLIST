const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const mime = require("mime-types");
const { removeVietnameseTones } = require("../utils/util");

// Tạo storage cho từng loại upload
const storageChecklist = (uploadFolderKey) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const userData = req.user?.data || {};
      const body = req?.body || {};
      let duan = userData?.ent_duan?.Duan || body?.Duan || "default";

      const uploadFolderMap = {
        checklist: path.join(__dirname, "..", "public", "checklist"),
        sucongoai: path.join(__dirname, "..", "public", "sucongoai"),
        baocaochiso: path.join(__dirname, "..", "public", "baocaochiso"),
        logo: path.join(__dirname, "..", "public", "logo"),
      };

      const uploadFolder = uploadFolderMap[uploadFolderKey];
      if (!uploadFolder) {
        return cb(new Error("Invalid upload folder key"), null);
      }

      const projectName = removeVietnameseTones(duan).replace(/[^a-zA-Z0-9-_]/g, "_");
      const projectFolder = path.join(uploadFolder, projectName);

      if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
      }

      cb(null, projectFolder);
    },
    filename: (req, file, cb) => {
      const userData = req?.user?.data || {};
      const ID_Duan = userData?.ID_Duan || req?.params?.id || "unknown";

      const filename = `${ID_Duan}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, filename);
    },
  });

const uploadChecklist = multer({
  storage: storageChecklist("checklist"),
});

const uploadSuCongNgoai = multer({
  storage: storageChecklist("sucongoai"),
});

const uploadBaoCaoChiSo = multer({
  storage: storageChecklist("baocaochiso"),
});

const uploadLogo = multer({
  storage: storageChecklist("logo"),
});

// Kiểm tra tính hợp lệ của file ảnh
const validateImage = (filePath) => {
  const mimeType = mime.lookup(filePath);
  const allowedTypes = ["image/png", "image/jpeg", "image/gif"];

  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`Invalid file type: ${mimeType}`);
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error("File is empty");
  }
};

// Hàm xử lý resize ảnh
const resizeImage = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const resizeResults = await Promise.allSettled(
        req.files.map(async (file) => {
          const originalPath = file.path;
          try {
            // Kiểm tra file ảnh hợp lệ
            validateImage(originalPath);

            // Resize và lưu ảnh
            const buffer = await sharp(originalPath)
              .resize(488, 650, { fit: sharp.fit.cover }) // Resize ảnh
              .jpeg({ quality: 90 }) // Chuyển sang JPEG để tối ưu
              .toBuffer();

            fs.writeFileSync(originalPath, buffer); // Ghi đè file gốc
            console.log(`Resized image: ${originalPath}`);
          } catch (err) {
            console.error(`Error resizing image ${originalPath}:`, err.message);
            throw err;
          }
        })
      );

      // Kiểm tra kết quả xử lý
      const failed = resizeResults.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        console.error("Some images failed to resize:", failed);
        return res.status(500).json({ error: "Some images failed to resize." });
      }
    }

    // Tất cả ảnh đã xử lý xong
    next();
  } catch (err) {
    console.error("Error during image processing:", err.message);
    res.status(500).json({ error: "An unexpected error occurred during image processing." });
  }
};

module.exports = {
  uploadChecklist,
  uploadSuCongNgoai,
  uploadBaoCaoChiSo,
  resizeImage,
  uploadLogo,
};
