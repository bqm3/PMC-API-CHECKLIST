// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const sharp = require("sharp");

// const uploadFolder = path.join(__dirname,"..", "public", "checklist");

// const storageChecklist = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Kiểm tra xem thư mục đã tồn tại chưa, nếu chưa thì tạo thư mục
//         if (!fs.existsSync(uploadFolder)) {
//           fs.mkdirSync(uploadFolder, { recursive: true }); // Tạo thư mục nếu chưa có
//         }
//         cb(null, uploadFolder); // Chỉ định thư mục đích
//       },
//   filename: (req, file, cb) => {
//     // Đặt tên tệp tải lên với thời gian hiện tại và tên tệp gốc
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const uploadChecklist = multer({ storage: storageChecklist });

// module.exports = {
//   uploadChecklist,
// };


const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require('sharp');

const uploadFolder = path.join(__dirname, "..", "public", "checklist");

const storageChecklist = multer.diskStorage({
  destination: (req, file, cb) => {
    // Kiểm tra xem thư mục đã tồn tại chưa, nếu chưa thì tạo thư mục
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true }); // Tạo thư mục nếu chưa có
    }
    cb(null, uploadFolder); // Chỉ định thư mục đích
  },
  filename: (req, file, cb) => {
    // Đặt tên tệp tải lên với thời gian hiện tại và tên tệp gốc
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadChecklist = multer({ storage: storageChecklist });

// Hàm xử lý resize ảnh
const resizeImage = (req, res, next) => {
    console.log('req.files',req.files)
    if (req.files && req.files.length > 0) {
      const resizePromises = req.files.map((file) => {
        const outputPath = file.path.replace(path.extname(file.path), "-resized" + path.extname(file.path));
    
        return sharp(file.path)
          .resize(800, 600, { fit: sharp.fit.inside, withoutEnlargement: true }) // Resize ảnh
          .jpeg({ quality: 80 }) // Chỉnh chất lượng ảnh
          .toFile(outputPath) // Lưu ảnh đã resize vào một file mới
          .then(() => {
            file.path = outputPath; // Cập nhật đường dẫn ảnh đã resize
          })
          .catch((err) => {
            console.error("Error resizing image:", err);
            throw err;
          });
      });
    
      // Chờ tất cả ảnh đã được resize
      Promise.all(resizePromises)
        .then(() => next()) // Tiếp tục xử lý
        .catch((err) => {
          // Xử lý lỗi nếu có ảnh nào đó không được resize
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
