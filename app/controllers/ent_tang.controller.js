const { Ent_tang, Ent_duan, Ent_user } = require("../models/setup.model");

// Create and Save a new Ent_tang
exports.create = async (req, res, next) => {
  // Validate request
  try {
    if (!req.body.Tentang) {
      res.status(400).json({
        message: "Cần nhập đầy đủ thông tin!",
      });
      return;
    }

    const userData = req.user.data;
    const tentangList = req.body.Tentang.split(",").map((t) => t.trim());

    // Create and save each floor record
    const records = [];
    for (let i = 0; i < tentangList.length; i++) {
      const data = {
        Sotang: i + 1,
        Tentang: tentangList[i],
        ID_User: userData.ID_User,
        ID_Duan: req.body.ID_Duan,
        isDelete: 0,
      };

      try {
        const createdRecord = await Ent_tang.create(data);
        records.push(createdRecord);
      } catch (err) {
        res.status(500).json({
          message: err.message || "Lỗi! Vui lòng thử lại sau.",
        });
        return;
      }
    }

    res.status(200).json({
      message: "Tạo tầng thành công!",
      data: records,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// exports.get = async (req, res) => {
//   try {
//     const userData = req.user.data;
//     if (userData && userData.ent_chucvu.Chucvu === "PSH") {
//       await Ent_duan.findAll({
//         where: {
//           isDelete: 0,
//         },
//       })
//         .then((data) => {
//           res.status(200).json({
//             message: "Danh sách dự án!",
//             data: data,
//           });
//         })
//         .catch((err) => {
//           res.status(500).json({
//             message: err.message || "Lỗi! Vui lòng thử lại sau.",
//           });
//         });
//     } else if (userData && userData.ent_chucvu.Chucvu !== "PSH") {
//       await Ent_duan.findAll({
//         where: {
//           [Op.and]: {
//             isDelete: 0,
//             ID_Duan: userData.ID_Duan,
//           },
//         },
//       })
//         .then((data) => {
//           res.status(200).json({
//             message: "Danh sách dự án!",
//             data: data,
//           });
//         })
//         .catch((err) => {
//           res.status(500).json({
//             message: err.message || "Lỗi! Vui lòng thử lại sau.",
//           });
//         });
//     } else {
//       return res.status(401).json({
//         message: "Bạn không có quyền truy cập",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message || "Lỗi! Vui lòng thử lại sau.",
//     });
//   }
// };
exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    // if (userData) {

    //   if (userData.ID_Duan !== null && userData.ID_Duan !== undefined) {
    //     orConditions.push({
    //       ID_Duan: userData?.ID_Duan,
    //     });
    //   }
    //   console.log('orConditions',orConditions)
    //   await Ent_tang.findAll({
    //     attributes: [
    //       "ID_Tang",
    //       "Tentang",
    //       "Sotang",
    //       "ID_User",
    //       "ID_Duan",
    //       "isDelete",
    //     ],
    //     include: [
    //       {
    //         model: Ent_duan,
    //         attributes: ["Duan", "Diachi"],
    //       },
    //       {
    //         model: Ent_user,
    //         attributes: ["Username", "Emails"],
    //       },
    //     ],
    //     where: {
    //       isDelete: 0,
    //       [Op.and]: [orConditions],
    //     },
    //   })
    //     .then((data) => {
    //       res.status(200).json({
    //         message: "Danh sách tầng!",
    //         data: data,
    //       });
    //     })
    //     .catch((err) => {
    //       res.status(500).json({
    //         message: err.message || "Lỗi! Vui lòng thử lại sau.",
    //       });
    //     });
    // }

    if (userData && userData.ent_chucvu.Chucvu === "PSH") {
      await Ent_tang.findAll({
        attributes: [
          "ID_Tang",
          "Tentang",
          "Sotang",
          "ID_User",
          "ID_Duan",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan", "Diachi"],
          },
          {
            model: Ent_user,
            attributes: ["Username", "Emails"],
          },
        ],
        where: {
          isDelete: 0,
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else if (userData && userData.ent_chucvu.Chucvu !== "PSH") {
      await Ent_tang.findAll({
        attributes: [
          "ID_Tang",
          "Tentang",
          "Sotang",
          "ID_User",
          "ID_Duan",
          "isDelete",
        ],
        include: [
          {
            model: Ent_duan,
            attributes: ["Duan", "Diachi"],
          },
          {
            model: Ent_user,
            attributes: ["Username", "Emails"],
          },
        ],
        where: {
          [Op.and]: {
            isDelete: 0,
            ID_Duan: userData.ID_Duan,
          },
        },
      })
        .then((data) => {
          res.status(200).json({
            message: "Danh sách dự án!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    } else {
      return res.status(401).json({
        message: "Bạn không có quyền truy cập",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
