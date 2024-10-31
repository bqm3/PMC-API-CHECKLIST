//check tầng data import excel
function checkDataExcel(data,index) {
    try{
      const tenKhuVuc = data['Tên khu vực'].toLowerCase(); // Chuyển đổi về chữ thường
      const tenHangMuc = data['Tên hạng mục'].toLowerCase(); // Chuyển đổi về chữ thường
      const tenTang = data['Tên tầng'].toLowerCase(); // Chuyển đổi về chữ thường
    
      // Kiểm tra xem tên khu vực có chứa từ "tầng" không
      if (tenKhuVuc.includes('tầng')) {
          // Lấy thông tin tầng từ tên tầng
          const tangPattern = /tầng\s*\d+/i; // Biểu thức chính quy để tìm "tầng" theo sau là số
          const matchTang = tenKhuVuc.match(tangPattern);
  
    
          if (matchTang) {
              const expectedTang = matchTang[0]; // Tầng mong đợi từ tên tầng
    
              // Kiểm tra xem tên hạng mục có chứa tầng mong đợi không
              if (!tenHangMuc.includes(expectedTang) || !tenTang.includes(expectedTang)) {
                  throw new Error(`Lỗi dòng ${index}, dữ liệu không hợp lệ (VD: Tầng)`);
              }
          } else {
            console.log('Lỗi: Không tìm thấy thông tin tầng trong tên khu vực')
            //   throw new Error('Lỗi: Không tìm thấy thông tin tầng trong tên khu vực.');
          }
      }
    } catch (err){
      throw err
    }
  }

  //format ngày
  function convertDateFormat(inputDate) {
    console.log("inputDate",inputDate)
    console.log("inputDate",typeof inputDate)
    // Kiểm tra xem inputDate có phải là chuỗi không
    if (typeof inputDate !== 'string') {
        throw new Error('Sai địng dạng ngày DD/MM/YYYY.');
    }

    // Tách ngày, tháng, năm
    const parts = inputDate.split('/');
    if (parts.length !== 3) {
        throw new Error('Invalid date format. Please use DD/MM/YYYY.');
    }

    const day = String(parts[0]).padStart(2, '0'); // Đảm bảo có 2 chữ số
    const month = String(parts[1]).padStart(2, '0'); // Đảm bảo có 2 chữ số
    const year = parts[2];

    // Trả về định dạng 'YYYY-MM-DD'
    return `${year}-${month}-${day}`;
}

module.exports = {
    convertDateFormat,
    checkDataExcel,
}
  
  