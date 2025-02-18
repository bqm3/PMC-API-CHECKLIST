const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const mime = require("mime-types");
const { removeVietnameseTones } = require("../utils/util");

// ✅ Kiểm tra và tạo thư mục nếu chưa tồn tại
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ✅ Cấu hình storage của Multer
const storageChecklist = (uploadFolderKey) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const userData = req.user?.data || {};
        const body = req?.body || {};
        let duan = userData?.ent_duan?.Duan || body?.Duan || "default";

        // 📌 Định nghĩa thư mục upload
        const uploadFolderMap = {
          checklist: path.join(__dirname, "..", "public", "checklist"),
          sucongoai: path.join(__dirname, "..", "public", "sucongoai"),
          baocaochiso: path.join(__dirname, "..", "public", "baocaochiso"),
          logo: path.join(__dirname, "..", "public", "logo"),
        };

        const uploadFolder = uploadFolderMap[uploadFolderKey];
        if (!uploadFolder)
          return cb(new Error("❌ Invalid upload folder key"), null);

        // 📌 Xử lý tên thư mục tránh ký tự đặc biệt
        const projectName = removeVietnameseTones(duan).replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );
        const projectFolder = path.join(uploadFolder, projectName);

        ensureDirExists(projectFolder);
        cb(null, projectFolder);
      } catch (err) {
        cb(err, null);
      }
    },
    filename: (req, file, cb) => {
      const userData = req?.user?.data || {};
      const ID_Duan = userData?.ID_Duan || req?.params?.id || "unknown";
      const filename = `${ID_Duan}_${Date.now()}${path.extname(
        file.originalname
      )}`;
      cb(null, filename);
    },
  });

// ✅ Giới hạn dung lượng file upload (10MB)
const uploadOptions = { limits: { fileSize: 10 * 1024 * 1024 } };

const uploadChecklist = multer({
  storage: storageChecklist("checklist"),
  ...uploadOptions,
});
const uploadSuCongNgoai = multer({
  storage: storageChecklist("sucongoai"),
  ...uploadOptions,
});
const uploadBaoCaoChiSo = multer({
  storage: storageChecklist("baocaochiso"),
  ...uploadOptions,
});
const uploadLogo = multer({
  storage: storageChecklist("logo"),
  ...uploadOptions,
});

// ✅ Kiểm tra file ảnh hợp lệ
const validateImage = (filePath) => {
  try {
    const mimeType = mime.lookup(filePath);
    const allowedTypes = ["image/png", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`❌ File không hợp lệ: ${mimeType}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error("❌ File rỗng!");
    }

    console.log(`✅ File hợp lệ: ${filePath}`);
  } catch (err) {
    console.error(`🚨 Lỗi kiểm tra file: ${err.message}`);
    throw err;
  }
};

// ✅ Resize ảnh an toàn với Sharp
const resizeImage = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const resizeResults = await Promise.allSettled(
        req.files.map(async (file) => {
          const originalPath = file.path;
          try {
            // 📌 Kiểm tra ảnh hợp lệ trước khi resize
            validateImage(originalPath);

            // 📌 Kiểm tra metadata trước khi xử lý
            const metadata = await sharp(originalPath).metadata();
            if (metadata.width < 100 || metadata.height < 100) {
              throw new Error(
                `❌ Ảnh quá nhỏ: ${metadata.width}x${metadata.height}`
              );
            }

            // 📌 Resize và ghi đè file
            const buffer = await sharp(originalPath)
              .resize(488, 650, { fit: sharp.fit.cover })
              .jpeg({ quality: 90 })
              .toBuffer();

            fs.writeFileSync(originalPath, buffer);
            console.log(`✅ Resized image: ${originalPath}`);
          } catch (err) {
            console.error(`🚨 Lỗi resize ảnh ${originalPath}:`, err.message);
            throw err;
          }
        })
      );

      // ❌ Kiểm tra nếu có ảnh lỗi
      const failed = resizeResults.filter(
        (result) => result.status === "rejected"
      );
      if (failed.length > 0) {
        return res
          .status(500)
          .json({ error: "Một số ảnh không thể xử lý.", details: failed });
      }
    }

    // ✅ Chuyển sang middleware tiếp theo nếu thành công
    next();
  } catch (err) {
    console.error("🚨 Lỗi khi xử lý ảnh:", err.message);
    res.status(500).json({ error: "Lỗi không mong muốn khi xử lý ảnh." });
  }
};

// ✅ Bọc Multer trong middleware để bắt lỗi đúng cách
const uploadHandler = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `❌ Lỗi upload: ${err.message}` });
    } else if (err) {
      return res
        .status(500)
        .json({ error: `❌ Lỗi không mong muốn: ${err.message}` });
    }
    next();
  });
};

// ✅ Xuất module
module.exports = {
  uploadChecklist,
  uploadSuCongNgoai,
  uploadBaoCaoChiSo,
  uploadLogo,
  resizeImage,
  uploadHandler,
};
