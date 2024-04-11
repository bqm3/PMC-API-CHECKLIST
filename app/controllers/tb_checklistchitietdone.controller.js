const { Tb_checklistchitietdone } = require("../models/setup.model");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  try {
    const userData = req.user.data;

    if (!userData) {
      res.status(401).json({
        message: "Bạn không có quyền tạo dự án!",
      });
      return;
    }
    if (!req.body.Description) {
      res.status(400).json({
        message: "Không thể checklist dữ liệu!",
      });
      return;
    }
    const descriptions = JSON.parse(req.body.Description);
    // Create a Tb_checklistchitietdone
    const data = {
      Description: descriptions || "",
      isDelete: 0,
    };

    // Save Tb_checklistchitietdone in the database
    Tb_checklistchitietdone.create(data)
      .then((data) => {
        res.status(200).json({
          message: "Checklist thành công!",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getDataFormat = async (req, res) => {
    try {
      const checklistDoneItems = await Tb_checklistchitietdone.findAll({
        attributes: ["Description"],
        where: { isDelete: 0 },
      });
  
      const arrPush = [];
  
      // Duyệt qua từng phần tử trong mảng checklistDoneItems
      checklistDoneItems.forEach((item) => {
        // Chuyển đổi chuỗi JSON thành một đối tượng JavaScript
        const descriptionArray = JSON.parse(item.dataValues.Description);
  
        // Lặp qua mỗi phần tử của mảng descriptionArray
        descriptionArray.forEach((description) => {
          // Tách các mục dữ liệu trước dấu phẩy (,)
          const splitByComma = description.split(',');
  
          // Lặp qua mỗi phần tử sau khi tách
          splitByComma.forEach((splitItem) => {
            // Trích xuất thông tin từ mỗi chuỗi
            const [ID_ChecklistC, ID_Checklist, valueCheck, gioht] = splitItem.split('/');
  
            // Kiểm tra điều kiện và thêm vào mảng arrPush nếu điều kiện đúng
            if (parseInt(ID_ChecklistC) === req.params.idc) {
              arrPush.push({
                ID_ChecklistC: parseInt(ID_ChecklistC),
                ID_Checklist: parseInt(ID_Checklist),
                valueCheck: valueCheck,
                gioht: gioht,
              });
            }
          });
        });
      });
  
      // Trả về dữ liệu hoặc thực hiện các thao tác khác ở đây
      res.status(200).json(arrPush);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
    }
  };
  
  