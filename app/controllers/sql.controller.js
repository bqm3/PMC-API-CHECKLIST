const Ent_checklist = require("../models/ent_checklist.model");

exports.query = async (req, res) => {
  try {
    await Ent_checklist.update(
      { Giatridinhdanh: "Auto", Giatriloi: "Off", Giatrinhan: "Auto / Man / Off"},
      {
        where: {
          Giatridinhdanh: "MAN",
          isDelete: 0
        },
      }
    )
      .then((data) => {
        res.status(200).json({
          message: "Update checklist thành công!",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
      });
  } catch (error) {}
};
