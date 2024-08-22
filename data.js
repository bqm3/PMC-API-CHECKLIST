const fs = require('fs');
const path = require('path');

// Thư mục chứa ảnh
const folderPath = "C:\\Users\\minhd\\Downloads";
const newDate = new Date('2023-08-22T10:00:00'); // Ngày giờ mới

// Lấy danh sách các tệp trong thư mục
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Lỗi khi đọc thư mục:', err);
    return;
  }

  // Lặp qua các tệp
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    
    // Chỉ áp dụng cho các tệp ảnh (jpg, png, jpeg)
    if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
      // Đặt thời gian sửa đổi và truy cập mới
      fs.utimes(filePath, newDate, newDate, (err) => {
        if (err) {
          console.error(`Lỗi khi thay đổi thời gian cho file ${file}:`, err);
        } else {
          console.log(`Thời gian của file ${file} đã được thay đổi.`);
        }
      });
    }
  });
});
