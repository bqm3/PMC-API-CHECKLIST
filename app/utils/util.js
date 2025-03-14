
const sequelize = require("../config/db.config");

//check tầng data import excel
function checkDataExcel(data, index, key) {
  try {
    const tenKhuVuc = data["Tên khu vực"]
      ?.toLowerCase()
      .normalize("NFC")
      .trim();
    const tenHangMuc = data["Tên hạng mục"]
      ?.toLowerCase()
      .normalize("NFC")
      .trim();
    const tenTang = data["Tên tầng"]?.toLowerCase().normalize("NFC").trim();

    const normalizeTang = (tang) => {
      const match = tang?.match(/tầng\s*(\d+)/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number >= 1 && number <= 9) {
          return `tầng 0${number}`;
        }
      }
      return tang;
    };

    const normalizedTenTang = normalizeTang(tenTang);

    // So sánh chặt chẽ hơn bằng cách sử dụng biểu thức chính quy
    const isValidFloor = (khuVuc, tang) => {
      const pattern = new RegExp(`\\b${tang}\\b`);
      const normalizedPattern = new RegExp(`\\b${normalizedTenTang}\\b`);
      return pattern.test(khuVuc) || normalizedPattern.test(khuVuc);
    };

    if (tenTang && key === 1) {
      if (tenKhuVuc?.includes("tầng") && !isValidFloor(tenKhuVuc, tenTang)) {
        throw new Error(
          `Lỗi dòng ${index}, dữ liệu tầng của khu vực không hợp lệ`
        );
      }
    } else if (tenTang && key === 2) {
      if (tenHangMuc?.includes("tầng") && !isValidFloor(tenHangMuc, tenTang)) {
        throw new Error(
          `Lỗi dòng ${index}, dữ liệu tầng của hạng mục không hợp lệ`
        );
      }
    }
  } catch (err) {
    throw err;
  }
}

//format ngày
function convertDateFormat(inputDate) {
  // Kiểm tra xem inputDate có phải là chuỗi không
  if(inputDate == undefined){
    return
  }
  
  if (typeof inputDate !== "string") {
    throw new Error("Sai địng dạng ngày DD/MM/YYYY.");
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

function getPreviousMonth(month, year) {
  // Tạo một đối tượng Date từ tháng hiện tại và giảm đi 1 tháng
  const date = new Date(year, month - 1, 1); // month - 1 vì tháng trong Date bắt đầu từ 0
  date.setMonth(date.getMonth() - 1);

  // Trích xuất tháng và năm mới
  const previousMonth = date.getMonth() + 1; // Thêm 1 vì getMonth() trả về giá trị từ 0-11
  const previousYear = date.getFullYear();

  return { month: previousMonth, year: previousYear };
}

const removeSpacesFromKeys = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = key?.replace(/\s+/g, "")?.toUpperCase();
    acc[newKey] = obj[key];
    return acc;
  }, {});
};

const formatVietnameseText = (text, i) => {
  // Kiểm tra nếu đầu vào không phải là chuỗi
  if (typeof text !== "string") {
    return text;
  }

  if (text == undefined || text == "" || text == null) {
    throw new Error("Cột không chứa dữ liệu ở dòng " + i);
  }

  // Xóa khoảng trắng thừa và ký tự đặc biệt, chuyển chữ cái đầu của mỗi từ thành chữ hoa
  let formattedText = text
    .replace(/\s+/g, " ")
    .replace(/[.,!?:;]+/g, "")
    .toLowerCase()
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formattedText;
};

//format text vn -> en
function removeVietnameseTones(str) {
  if (str == null || str == "" || str == undefined) return "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const isValidNumber = (value) => {
  const regex = /^(\d+([.,]\d{1,2})?)$/; // Số nguyên hoặc số thập phân có dấu '.' hoặc ','
  return regex.test(value);
};

function formatNumber(input) {
  // Loại bỏ tất cả các chữ cái và ký tự không phải số hoặc dấu phẩy
  const cleanedInput = input.replace(/[^\d,]/g, "");
  // Thay dấu phẩy (,) bằng dấu chấm (.)
  const formattedInput = cleanedInput.replace(/,/g, ".");
  return formattedInput;
}

const getDynamicTableName = (date) => {
  const month = new Date(date).getMonth() + 1; // Lấy tháng (bắt đầu từ 0)
  const year = new Date(date).getFullYear(); // Lấy năm
  return `tb_checklistchitiet_${month.toString().padStart(2, "0")}_${year}`;
};

const getMonthsRange = (start, end) => {
  const months = [];
  let current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = (current.getMonth() + 1).toString().padStart(2, "0"); // Định dạng thành '01', '02'...
    months.push({ year, month });
    current.setMonth(current.getMonth() + 1); // Tiến tới tháng kế tiếp
  }

  return months;
};

//YYYY/MM/DD
const funcCreateYesterDay = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = yesterday.toLocaleDateString('en-GB').split('/').join('/');
    return formattedYesterday
}

const validatePassword = (password) => {
  // Kiểm tra nếu mật khẩu chỉ là số
  const isAllDigits = /^\d+$/.test(password);

  if (isAllDigits) {
    return false; // Nếu chỉ toàn số, trả về false
  }

  // Nếu không phải là toàn số, thì hợp lệ
  return password?.length >= 6;
};

const createDynamicTableChiTiet = async (tableName) => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ID_Checklistchitiet INT AUTO_INCREMENT PRIMARY KEY,
      ID_ChecklistC INT,
      ID_Checklist INT,
      Vido VARCHAR(50) DEFAULT NULL,
      Kinhdo VARCHAR(50) DEFAULT NULL,
      Docao VARCHAR(50) DEFAULT NULL,
      Ketqua VARCHAR(255) DEFAULT NULL,
      Gioht DATETIME,
      Ghichu TEXT DEFAULT NULL,
      isScan INT DEFAULT NULL,
      Anh TEXT DEFAULT NULL,
      Ngay DATE,
      isCheckListLai INT DEFAULT 0,
      isDelete INT DEFAULT 0,
      createdAt TIMESTAMP,
      updatedAt TIMESTAMP,
      FOREIGN KEY (ID_ChecklistC) REFERENCES tb_checklistc(ID_ChecklistC),
      FOREIGN KEY (ID_Checklist) REFERENCES ent_checklist(ID_Checklist)
    );
  `;
  await sequelize.query(query);
};

const createDynamicTableDone = async (tableName) => {
  const query = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    ID_Checklistchitietdone INT AUTO_INCREMENT PRIMARY KEY,
    ID_ChecklistC INT,
    Description TEXT,
    Gioht TIME,
    Vido VARCHAR(50),
    Kinhdo VARCHAR(50),
    Docao VARCHAR(50),
    isScan INT DEFAULT NULL,
    isCheckListLai INT DEFAULT 0,
    isDelete INT DEFAULT 0,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    FOREIGN KEY (ID_ChecklistC) REFERENCES tb_checklistc(ID_ChecklistC)
  )
`;
  await sequelize.query(query);
};

// https://checklist.pmcweb.vn/upload/baocaosuco
const BASE_URL_IMAGE = "https://checklist.pmcweb.vn/be/upload"

const funcBaseUri_Image = (key, image) => {
  let uri = ""
  switch (key) {
    // checklist
    case 1:
      uri = `${BASE_URL_IMAGE}/checklist/${image}`;
      break;
    // báo cáo chỉ số
    case 2:
      uri = `${BASE_URL_IMAGE}/baocaochiso/${image}`;
      break;
    // sự cố ngoài
    case 3:
      uri = `${BASE_URL_IMAGE}/sucongoai/${image}`;
      break;
  }
  return uri;
};

module.exports = {
  convertDateFormat,
  checkDataExcel,
  formatVietnameseText,
  removeSpacesFromKeys,
  removeVietnameseTones,
  getPreviousMonth,
  isValidNumber,
  getDynamicTableName,
  getMonthsRange,
  formatNumber,
  funcCreateYesterDay,
  createDynamicTableDone,
  createDynamicTableChiTiet,
  validatePassword,
  funcBaseUri_Image
};
