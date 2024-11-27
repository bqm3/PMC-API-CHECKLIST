const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadFolder = path.join(__dirname, "..", "public", "checklist");

const storageChecklist = multer.diskStorage({
  destination: (req, file, cb) => {
    const userData = req.user.data;

    if (!userData || !userData.ent_duan || !userData.ent_duan.Duan) {
      return cb(new Error("Project name (Duan) is required"), null);
    }

    const projectName = userData.ent_duan.Duan.replace(/[^a-zA-Z0-9-_]/g, "_"); // Loại bỏ ký tự không hợp lệ
    const projectFolder = path.join(uploadFolder, projectName); // Tạo đường dẫn thư mục theo tên dự án

    // Kiểm tra và tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(projectFolder)) {
      fs.mkdirSync(projectFolder, { recursive: true });
    }

    cb(null, projectFolder); // Chỉ định thư mục đích
  },
  filename: (req, file, cb) => {
    const userData = req.user.data;

    if (!userData || !userData.ID_Duan) {
      return cb(new Error("ID_Duan is required"), null);
    }

    // Tên tệp với ID_Duan và thời gian hiện tại
    const filename = `${userData.ID_Duan}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const uploadChecklist = multer({ storage: storageChecklist });

// Hàm xử lý resize ảnh
const resizeImage = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    const resizePromises = req.files.map((file) => {
      const originalPath = file.path;
      const tempPath = originalPath.replace(
        path.extname(originalPath),
        "-temp" + path.extname(originalPath)
      );

      return sharp(originalPath)
        .resize(800, 600, { fit: sharp.fit.inside, withoutEnlargement: true }) // Resize ảnh
        .jpeg({ quality: 80 }) // Giảm chất lượng ảnh
        .toFile(tempPath) // Ghi vào tệp tạm
        .then(() => {
          fs.unlinkSync(originalPath); // Xóa tệp gốc
          fs.renameSync(tempPath, originalPath); // Đổi tên tệp tạm thành tệp gốc
        })
        .catch((err) => {
          console.error("Error resizing image:", err);
          throw err;
        });
    });

    Promise.all(resizePromises)
      .then(() => next()) // Tiếp tục xử lý
      .catch((err) => {
        console.error("Error resizing images.", err);
        res.status(500).send("Error resizing images.");
      });
  } else {
    next(); // Không có ảnh, tiếp tục
  }
};

module.exports = {
  uploadChecklist,
  resizeImage,
};
