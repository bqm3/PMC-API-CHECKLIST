const fs = require('fs');
const axios = require("axios");
const FormData = require("form-data");
const endpointUrl = "https://lens.google.com/v3/upload";  

const postImage = async (imageBuffer, endpointUrl) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append("encoded_image", imageBuffer, {
      filename: "image.jpg", 
      contentType: "image/jpeg", 
    });

    const response = await axios.post(endpointUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    const regexPattern = /",\[\[(\[".*?"\])\],"/;
    const match = response.data.match(regexPattern);

    if (match && match[1]) {
      const extractedData = match[1];
      return JSON.parse(extractedData);
    } else {
      return "Không lấy được thông tin ảnh.";
    }

  } catch (error) {
    throw error;  
  }
};

const uploadFile = async (req, res) => {
  try {

    // Kiểm tra xem file có được upload lên không
    if (!req.file) {
      return res.status(401).json({ error: "Please provide an image" });
    }

    // Gửi ảnh trực tiếp từ buffer lên API OCR
    const data = await postImage(req.file.buffer, endpointUrl);

    // Trả kết quả về cho client
    return res.status(200).json({ result: data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadFile,
  postImage
};
