const { uploadFile } = require("../middleware/auth_google");
const {
  Ent_baocaochiso,
} = require("../models/setup.model");
const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/db.config");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    const { body, files } = req;
    const {
      ID_Duan,
      Day,
      Month,
      Year,
      Electrical,
      Water,
      ElectricalBefore,
      WaterBefore,
      Ghichu,
    } = body;

    const uploadedFileIds = [];
    console.log(files)
    // if (files) {
    //   for (const image of files) {
    //     const fileId = await uploadFile(image);
    //     uploadedFileIds.push({ id: fileId, name: image.originalname });
    //   }
    // }
    // const ids = uploadedFileIds.map((file) => file.id.id);

    // // Nối các id lại thành chuỗi, cách nhau bằng dấu phẩy
    // const idsString = ids.join(",");

    // const data = {
    //   Ngaysuco: Ngaysuco || null,
    //   Giosuco: Giosuco || null,
    //   ID_Hangmuc:
    //     `${ID_Hangmuc}` !== "null" && `${ID_Hangmuc}` !== "undefined"
    //       ? ID_Hangmuc
    //       : null,
    //   Noidungsuco: Noidungsuco || null,
    //   Tinhtrangxuly: 0,
    //   Duongdancacanh: idsString || null,
    //   ID_User: ID_User,
    // };

    // Tb_sucongoai.create(data)
    //   .then(() => {
    //     res.status(200).json({
    //       message: "Gửi sự cố thành công!",
    //     });
    //   })
    //   .catch((err) => {
    //     res.status(500).json({
    //       message: err.message || "Lỗi! Vui lòng thử lại sau.",
    //     });
    //   });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};