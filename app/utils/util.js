//check tầng data import excel
function checkDataExcel(data,index,key) {
    try{
      const tenKhuVuc = data['Tên khu vực'].toLowerCase(); // Chuyển đổi về chữ thường
      const tenHangMuc = data['Tên hạng mục'].toLowerCase(); // Chuyển đổi về chữ thường
      const tenTang = data['Tên tầng'].toLowerCase(); // Chuyển đổi về chữ thường
    
      if (tenTang && key == 1) {
        if (tenKhuVuc.includes('tầng')){
            const check = tenKhuVuc.includes(tenTang)
            if(!check){
                throw new Error(`Lỗi dòng ${index}, dữ liệu tầng của khu vực không hợp lệ`);
            }
        }
      } else {
        if (tenHangMuc.includes('tầng')){
            const check = tenHangMuc.includes(tenTang)
            if(!check){
                throw new Error(`Lỗi dòng ${index}, dữ liệu tầng của khu vực không hợp lệ`);
            }
        }
      }
    } catch (err){
      throw err
    }
  }

//format ngày
function convertDateFormat(inputDate) {
  console.log("inputDate", inputDate);
  console.log("inputDate", typeof inputDate);
  // Kiểm tra xem inputDate có phải là chuỗi không
  if (typeof inputDate !== "string") {
    throw new Error("Sai địng dạng ngày DD/MM/YYYY."); 
    // tầng mái

    // TẦNG MÁI
    // Tầng mái 
    // tầng mái hiên
    // tầng Hiên mái
    // tầng 1

    // format UPPERCASE
    // tầng 12 = tầng
    // khu vực tầng 12  = kv có chữ tầng => FORMAT UPPERCASE => KHU VỰC TẦNG MÁI ~ TẦNG MÁI
  }

  // Tách ngày, tháng, năm
  const parts = inputDate.split("/");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Please use DD/MM/YYYY.");
  }

  const day = String(parts[0]).padStart(2, "0"); // Đảm bảo có 2 chữ số
  const month = String(parts[1]).padStart(2, "0"); // Đảm bảo có 2 chữ số
  const year = parts[2];

  // Trả về định dạng 'YYYY-MM-DD'
  return `${year}-${month}-${day}`;
}

module.exports = {
  convertDateFormat,
  checkDataExcel,
};
