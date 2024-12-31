const PhiDV = require("../models/ketoan.model");
const {
    Ent_toanha,
    Ent_khuvuc,
    Ent_khoicv,
    Ent_duan,
    Ent_hangmuc,
    Ent_tang,
    Ent_checklist,
    Ent_khuvuc_khoicv,
  } = require("../models/setup.model");
  const { Op, Sequelize, fn, col, literal, where } = require("sequelize");
  const sequelize = require("../config/db.config");
  const xlsx = require("xlsx");
  const e = require("express");
  const fs = require("fs");
  const path = require("path");
  const archiver = require("archiver");
  const axios = require("axios");
  const {
    checkDataExcel,
    removeSpacesFromKeys,
    formatVietnameseText,
    removeVietnameseTones,
  } = require("../utils/util");
  const { format } = require('date-fns');




  function excelDateToJSDate(serial) {
    if (isNaN(serial) || serial <= 0) {
      throw new Error('Ngày không hợp lệ');
    }
  
    const excelStartDate = new Date(Date.UTC(1899, 11, 30)); // Ngày bắt đầu của Excel
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const excelFix = 0; // Điều chỉnh số ngày cho bug của Excel
    const jsDate = new Date(excelStartDate.getTime() + (serial - excelFix) * millisecondsPerDay);
  
    // Sử dụng UTC để tránh ảnh hưởng của múi giờ
    const formattedDate = new Date(Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()));
  
    if (isNaN(formattedDate.getTime())) {
      throw new Error('Ngày chuyển đổi không hợp lệ');
    }
  
    return formattedDate;
  }
  
  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  
  exports.uploadFiles = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
  
      // Đọc tệp Excel từ buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  
      // Lấy dữ liệu từ sheet đầu tiên
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      const processValue = (value) => {
        // Nếu là chuỗi, loại bỏ khoảng trắng và kiểm tra nếu chuỗi rỗng thì gán null
        if (typeof value === "string") {
          return value.trim() === "" ? null : value;
        }
        // Nếu là undefined thì gán null
        if (value === undefined) {
          return null;
        }
        // Các giá trị còn lại không thay đổi
        return value;
      };
      await sequelize.transaction(async (transaction) => {
        for (const [index, item] of data.entries()) {
          try {
            const ngaybangiao = item["ngaybangiao"];
            let formattedNgayBangiao = null; // Mặc định là null
  
            // Kiểm tra nếu ngày không rỗng và hợp lệ
            if (ngaybangiao && !isNaN(ngaybangiao)) {
              const excelDate = excelDateToJSDate(ngaybangiao); // Chuyển đổi ngày từ Excel
              formattedNgayBangiao = formatDate(excelDate); // Định dạng ngày
            }
  
            const dataRes = {
              Ten_du_an: processValue(item["Ten_du_an"]),
              vitri: processValue(item["vitri"]),
              canho: processValue(item["canho"]),
              ngaybangiao: processValue(formattedNgayBangiao), // Giữ lại ngày nếu hợp lệ
              chuho: processValue(item["chuho"]),
              dientich: item["dientich"], // Không cần xử lý vì là số
              phidvphainop: processValue(item["phidvphainop"]),
              phidvdathu: processValue(item["phidvdathu"]),
              phidvphaithu: processValue(item["phidvphaithu"]),
              SLoto: item["SLoto"], // Không cần xử lý vì là số
              phioto: processValue(item["phioto"]),
              phiotodathu: processValue(item["phiotodathu"]),
              phiotophaithu: processValue(item["phiotophaithu"]),
              SLxemay: item["SLxemay"], // Không cần xử lý vì là số
              phixemay: processValue(item["phixemay"]),
              phixmdathu: processValue(item["phixmdathu"]),
              phixmphaithu: processValue(item["phixmphaithu"]),
              SLxedien: item["SLxedien"], // Không cần xử lý vì là số
              phixedien: processValue(item["phixedien"]),
              phixddathu: processValue(item["phixddathu"]),
              phixdphaithu: processValue(item["phixdphaithu"]),
              SLxedap: item["SLxedap"], // Không cần xử lý vì là số
              phixedap: processValue(item["phixedap"]),
              phixedapdathu: processValue(item["phixedapdathu"]),
              phixedapphaithu: processValue(item["phixedapphaithu"]),
              tongphaithu_thang: processValue(item["tongphaithu_thang"]),
              nocu: processValue(item["nocu"]),
              tongdathu_thang: processValue(item["tongdathu_thang"]),
              tongconphaithu_thang: processValue(item["tongconphaithu_thang"]),
              thoigian_no: processValue(item["thoigian_no"]),
              lydo_no: processValue(item["lydo_no"]),
              dieuchinh_nocu: processValue(item["dieuchinh_nocu"]),
              lydo_dieuchinh: processValue(item["lydo_dieuchinh"]),
              Email: processValue(item["Email"]),
              thang: item["thang"], // Không cần xử lý vì là số
              nam: item["nam"], // Không cần xử lý vì là số
            };
            
            console.log(dataRes);
            
            await PhiDV.create(dataRes, { transaction });
  
            console.log('Dữ liệu sau khi xử lý:', dataRes);
          } catch (error) {
            throw new Error(`Lỗi ở dòng ${index + 2}: ${error.message}`);
          }
        }
      });
  
      res.send({
        message: "Upload dữ liệu thành công",
        data,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message || "Lỗi! Vui lòng thử lại sau.",
      });
    }
  };
  