const {
  Ent_duan,
  Ent_khuvuc,
  Ent_toanha,
  Ent_hangmuc,
  Ent_nhom,
  Ent_khuvuc_khoicv,
  Ent_khoicv,
  Ent_phanloaida,
  Ent_chinhanh,
} = require("../models/setup.model");
const { Op, Sequelize, fn, col, literal, where } = require("sequelize");
var path = require("path");
const { formatVietnameseText } = require("../utils/util");
const { uploadFile } = require("../middleware/auth_google");

exports.create = async (req, res) => {
  try {
    const userData = req.user.data;
    const fileId = await uploadFile(req.files[0]);

    if (!userData) {
      res.status(401).json({
        message: "Bạn không có quyền tạo dự án!",
      });
      return;
    }
    if (!req.body.Duan) {
      res.status(400).json({
        message: "Phải nhập đầy đủ dữ liệu!",
      });
      return;
    }

    // Create a Ent_duan
    const data = {
      Duan: formatVietnameseText(req.body.Duan),
      Ngaybatdau: req.body.Ngaybatdau,
      ID_Nhom: req.body.ID_Nhom || null,
      ID_Chinhanh: req.body.ID_Chinhanh || null,
      ID_Linhvuc: req.body.ID_Linhvuc || null,
      ID_Loaihinh: req.body.ID_Loaihinh || null,
      ID_Phanloai: req.body.ID_Phanloai || null,
      Diachi: req.body.Diachi,
      Vido: req.body.Vido,
      Kinhdo: req.body.Kinhdo,
      Logo:
        req.body.Logo || `https://drive.google.com/thumbnail?id=${fileId.id}`,
      isDelete: 0,
    };

    // Save Ent_duan in the database
    Ent_duan.create(data)
      .then((data) => {
        res.status(200).json({
          message: "Tạo dự án thành công!",
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

exports.get = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData && userData.ent_chucvu.Chucvu === "PSH") {
      await Ent_duan.findAll({
        attributes: [
          "ID_Duan",
          "Duan",
          "Diachi",
          "ID_Nhom",
          "ID_Chinhanh",
          "ID_Linhvuc",
          "ID_Loaihinh",
          "ID_Phanloai",
          "Vido",
          "Kinhdo",
          "Logo",
          "isDelete",
        ],
        include: [
          {
            model: Ent_toanha,
            as: "ent_toanha",
            attributes: ["Toanha", "Sotang", "ID_Duan", "Vido", "Kinhdo"],
            where: { isDelete: 0 },
            required: false,
          },
          {
            model: Ent_nhom,
            as: "ent_nhom",
            attributes: ["Tennhom", "ID_Nhom"],
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
      await Ent_duan.findAll({
        attributes: [
          "ID_Duan",
          "Duan",
          "Diachi",
          "ID_Nhom",
          "ID_Chinhanh",
          "ID_Linhvuc",
          "ID_Loaihinh",
          "ID_Phanloai",
          "Vido",
          "Kinhdo",
          "Logo",
          "isDelete",
        ],
        include: [
          {
            model: Ent_toanha,
            as: "ent_toanha",
            attributes: ["Toanha", "Sotang", "ID_Duan", "Vido", "Kinhdo"],
            where: { isDelete: 0 },
            required: false,
          },
          {
            model: Ent_nhom,
            as: "ent_nhom",
            attributes: ["Tennhom", "ID_Nhom"],
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

exports.getDetail = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData && userData.ent_chucvu.Chucvu === "PSH") {
      await Ent_duan.findByPk(req.params.id, {
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
      await Ent_duan.findAll({
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

exports.update = async (req, res) => {
  try {
    const userData = req.user.data;
    const fileId = await uploadFile(req.files[0]);

    const uploadedFiles = req.files.map((file) => {
      // Lấy thư mục và tên tệp từ đường dẫn
      const projectFolder = path.basename(path.dirname(file.path)); // Tên dự án (thư mục cha của tệp)
      const filename = path.basename(file.filename); // Tên tệp gốc

      return {
        fieldname: file.fieldname, // Lấy fieldname từ tệp tải lên
        fileId: { id: `${projectFolder}/${filename}` }, // Đường dẫn thư mục dự án và tên ảnh
        filePath: file.path, // Đường dẫn vật lý của tệp
      };
    });
    const isEmpty = (obj) => Object.keys(obj).length === 0;
    console.log("uploadedFiles", uploadedFiles);

    const uploadedFileIds = [];
    uploadedFiles.forEach((file) => {
      uploadedFileIds.push(file); // Đẩy đối tượng tệp vào mảng
    });

    console.log();

    console.log("uploadedFileIds", uploadedFileIds);
    let Anh = "";
    if ( uploadedFileIds.length > 0) {
      if (uploadedFileIds) {
        Anh = uploadedFileIds[0].fileId.id;
      } else {
        console.log(`No matching image found for Anh: ${imageIndex}`);
      }
    }

    if (req.params.id && userData) {
      Ent_duan.update(
        {
          Duan: req.body.Duan,
          Diachi: req.body.Diachi,
          Vido: req.body.Vido,
          Kinhdo: req.body.Kinhdo,
          Logo: req.body.Logo || `https://checklist.pmcweb.vn/be/upload/logo/${Anh}`,
          Ngaybatdau: req.body.Ngaybatdau,
          ID_Nhom: req.body.ID_Nhom || null,
          ID_Chinhanh: req.body.ID_Chinhanh || null,
          ID_Linhvuc: req.body.ID_Linhvuc || null,
          ID_Loaihinh: req.body.ID_Loaihinh || null,
          ID_Phanloai: req.body.ID_Phanloai || null,
        },
        {
          where: {
            ID_Duan: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Dự án chi tiết!",
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const userData = req.user.data;
    if (req.params.id && userData) {
      Ent_duan.update(
        { isDelete: 1 },
        {
          where: {
            ID_Duan: req.params.id,
          },
        }
      )
        .then((data) => {
          res.status(200).json({
            message: "Xóa dự án thành công!",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message || "Lỗi! Vui lòng thử lại sau.",
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getKhuvucByDuan = async (req, res) => {
  try {
    const data = await Ent_duan.findAll({
      attributes: [
        "ID_Duan",
        "Duan",
        "Diachi",
        "ID_Nhom",
        "ID_Chinhanh",
        "ID_Linhvuc",
        "ID_Loaihinh",
        "ID_Phanloai",
        "Vido",
        "Kinhdo",
        "Logo",
        "isDelete",
      ],
      include: [
        {
          model: Ent_toanha,
          as: "ent_toanha",
          attributes: ["Toanha", "Sotang", "ID_Duan", "Vido", "Kinhdo"],
          where: { isDelete: 0 },
          required: false,
        },
        {
          model: Ent_nhom,
          as: "ent_nhom",
          attributes: ["Tennhom", "ID_Nhom"],
        },
      ],
      where: {
        isDelete: 0,
      },
    });

    const result = data.map((duan) => ({
      ID_Duan: duan.ID_Duan,
      Duan: duan.Duan,
      Diachi: duan.Diachi,
      Vido: duan.Vido,
      Kinhdo: duan.Kinhdo,
      ID_Nhom: duan.ID_Nhom,
      Logo: duan.Logo,
      toanhas: duan.ent_toanha.map((khuvuc) => ({
        ID_Toanha: khuvuc.ID_Toanha,
        Toanha: khuvuc.Toanha,
        Sotang: khuvuc.Sotang,
        Vido: khuvuc.Vido,
        Kinhdo: khuvuc.Kinhdo,
      })),
    }));

    res.status(200).json({
      message: "Danh sách dự án với khu vực!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getThongtinduan = async (req, res) => {
  try {
    const userData = req.user.data;

    const duanIds = userData?.arr_Duan
      ? userData?.arr_Duan.split(",").map((id) => parseInt(id, 10))
      : [];

    const whereCondition = {
      isDelete: 0,
    };

    if (userData && (userData?.ent_chucvu?.Role == 4 || userData?.ent_chucvu?.Role == 1) && duanIds.length > 0) {
      whereCondition.ID_Duan = {
        [Op.in]: duanIds,
      };
    }

    const data = await Ent_duan.findAll({
      attributes: [
        "ID_Duan",
        "Duan",
        "Diachi",
        "Vido",
        "Kinhdo",
        "ID_Nhom",
        "ID_Chinhanh",
        "ID_Linhvuc",
        "ID_Loaihinh",
        "ID_Phanloai",
        "Logo",
        "isDelete",
      ],
      include: [
        // {
        //   model: Ent_toanha,
        //   as: "ent_toanha",
        //   attributes: [
        //     "ID_Toanha",
        //     "Toanha",
        //     "Sotang",
        //     "ID_Duan",
        //     "Vido",
        //     "Kinhdo",
        //     "isDelete",
        //   ],
        //   where: { isDelete: 0 },
        //   required: false,
        //   include: [
        //     {
        //       model: Ent_khuvuc,
        //       as: "ent_khuvuc",
        //       attributes: [
        //         "ID_Khuvuc",
        //         "Makhuvuc",
        //         "MaQrCode",
        //         "Tenkhuvuc",
        //         "isDelete",
        //       ],
        //       where: { isDelete: 0 },
        //       required: false,
        //       include: [
        //         {
        //           model: Ent_hangmuc,
        //           as: "ent_hangmuc",
        //           attributes: [
        //             "ID_Hangmuc",
        //             "ID_Khuvuc",
        //             "Hangmuc",
        //             "MaQrCode",
        //             "isDelete",
        //             "Tieuchuankt",
        //             "FileTieuChuan",
        //           ],
        //           where: { isDelete: 0 },
        //           required: false,
        //         },
        //         {
        //           model: Ent_khuvuc_khoicv,
        //           attributes: ["ID_KhoiCV", "ID_Khuvuc", "ID_KV_CV"],
        //           include: [
        //             {
        //               model: Ent_khoicv,
        //               attributes: ["KhoiCV", "Ngaybatdau", "Chuky"],
        //             },
        //           ],
        //         },
        //       ],
        //     },
        //   ],
        // },
        {
          model: Ent_chinhanh,
          attributes: ["Tenchinhanh", "ID_Chinhanh"],
        },
        {
          model: Ent_nhom,
          attributes: ["Tennhom", "ID_Nhom"],
        },
        {
          model: Ent_phanloaida,
          as: "ent_phanloaida",
          attributes: ["ID_Phanloai", "Phanloai"],
        },
      ],
      where: whereCondition, // Apply the dynamic where condition
    });

    // const result = data.map((duan) => {
    //   let totalHangmucInDuan = 0;
    //   let totalKhuvucInDuan = 0;

    //   const toanhas = duan.ent_toanha.map((toanha) => {
    //     let totalHangmucInToanha = 0;
    //     const khoisSet = new Set(); // Sử dụng Set để loại bỏ trùng lặp tên khối
    //     const khuvucs = toanha.ent_khuvuc.map((khuvuc) => {
    //       const hangmucs = khuvuc.ent_hangmuc.map((hangmuc) => ({
    //         ID_Hangmuc: hangmuc.ID_Hangmuc,
    //         Hangmuc: hangmuc.Hangmuc,
    //         MaQrCode: hangmuc.MaQrCode,
    //         Tieuchuankt: hangmuc.Tieuchuankt,
    //       }));

    //       const khoicvs = khuvuc.ent_khuvuc_khoicvs.map((cv) => {
    //         khoisSet.add(cv.ent_khoicv.KhoiCV); // Thêm tên khối vào Set
    //         return {
    //           ID_KhoiCV: cv.ID_KhoiCV,
    //           ID_Khuvuc: cv.ID_Khuvuc,
    //           ID_KV_CV: cv.ID_KV_CV,
    //         };
    //       });

    //       const hangMucLength = hangmucs.length;
    //       totalHangmucInToanha += hangMucLength;
    //       return {
    //         ID_Khuvuc: khuvuc.ID_Khuvuc,
    //         ID_KhoiCVs: khoicvs,
    //         Makhuvuc: khuvuc.Makhuvuc,
    //         MaQrCode: khuvuc.MaQrCode,
    //         Tenkhuvuc: khuvuc.Tenkhuvuc,
    //         hangMucLength: hangMucLength,
    //         hangmuc: hangmucs,
    //       };
    //     });

    //     const khuvucLength = khuvucs.length;
    //     totalHangmucInDuan += totalHangmucInToanha;
    //     totalKhuvucInDuan += khuvucLength;

    //     const tenKhois = Array.from(khoisSet); // Chuyển Set thành mảng tên khối
    //     return {
    //       ID_Toanha: toanha.ID_Toanha,
    //       Toanha: toanha.Toanha,
    //       Sotang: toanha.Sotang,
    //       Vido: toanha.Vido,
    //       Kinhdo: toanha.Kinhdo,
    //       khuvucLength: khuvucLength,
    //       khuvuc: khuvucs,
    //       totalHangmucInToanha,
    //       tenKhois, // Thêm trường danh sách tên khối
    //     };
    //   });
    //   // "ID_Nhom",
    //   // "ID_Chinhanh",
    //   // "ID_Linhvuc",
    //   // "ID_Loaihinh",
    //   // "ID_Phanloai",
    //   return {
    //     ID_Duan: duan.ID_Duan,
    //     ID_Nhom: duan.ID_Nhom,
    //     ID_Chinhanh: duan.ID_Chinhanh,
    //     ID_Loaihinh: duan.ID_Loaihinh,
    //     ID_Phanloai: duan.ID_Phanloai,
    //     Duan: duan.Duan,
    //     Diachi: duan.Diachi,
    //     Vido: duan.Vido,
    //     Kinhdo: duan.Kinhdo,
    //     Logo: duan.Logo,
    //     toanhas: toanhas,
    //     totalHangmucInDuan,
    //     totalKhuvucInDuan,
    //   };
    // });

    res.status(200).json({
      message: "Danh sách dự án với khu vực!",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getThongtinduantheonhom = async (req, res) => {
  try {
    const data = await Ent_duan.findAll({
      attributes: [
        "ID_Duan",
        "Duan",
        "Diachi",
        "Vido",
        "Kinhdo",
        "ID_Nhom",
        "ID_Chinhanh",
        "ID_Linhvuc",
        "ID_Loaihinh",
        "ID_Phanloai",
        "Logo",
        "isDelete",
      ],
      include: [
        {
          model: Ent_chinhanh,
          attributes: ["Tenchinhanh", "ID_Chinhanh"],
        },
        {
          model: Ent_nhom,
          attributes: ["Tennhom", "ID_Nhom"],
        },
        {
          model: Ent_phanloaida,
          as: "ent_phanloaida",
          attributes: ["ID_Phanloai", "Phanloai"],
        },
      ],
      where: {
        isDelete: 0,
        ID_Duan: {
          [Op.ne]: 1,
        },
      },
    });

    const groupedData = data.reduce((acc, item) => {
      const groupName = item.ent_chinhanh?.Tenchinhanh;

      // Nếu chưa có key với tên nhóm, tạo mới
      if (!acc[groupName]) {
        acc[groupName] = [];
      }

      // Thêm dự án vào nhóm tương ứng
      acc[groupName].push(item);

      return acc;
    }, {});

    res.status(200).json({
      message: "Danh sách dự án với nhóm!",
      data: groupedData,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

exports.getProjectbyName = async (req, res) => {
  try {
    const data = await Ent_duan.findAll({
      attributes: [
        "ID_Duan",
        "Duan",
        "Diachi",
        "Vido",
        "Kinhdo",
        "ID_Nhom",
        "ID_Chinhanh",
        "ID_Linhvuc",
        "ID_Loaihinh",
        "ID_Phanloai",
        "Logo",
        "isDelete",
      ],
      include: [
        {
          model: Ent_chinhanh,
          attributes: ["Tenchinhanh", "ID_Chinhanh"],
        },
        {
          model: Ent_nhom,
          attributes: ["Tennhom", "ID_Nhom"],
        },
        {
          model: Ent_phanloaida,
          as: "ent_phanloaida",
          attributes: ["ID_Phanloai", "Phanloai"],
        },
      ],
      where: {
        isDelete: 0,
        // ID_Duan: {
        //   [Op.ne]: 1,
        // },
      },
    });

    const groupedDataObject = data.reduce((acc, project) => {
      const { ID_Chinhanh, ent_chinhanh } = project;

      if (!acc[ID_Chinhanh]) {
        acc[ID_Chinhanh] = {
          Tenchinhanh: ent_chinhanh.Tenchinhanh,
          projects: [],
        };
      }

      acc[ID_Chinhanh].projects.push(project);
      return acc;
    }, {});

    // Convert the object into an array
    const groupedData = Object.values(groupedDataObject);

    res.status(200).json({
      message: "Danh sách dự án với nhóm!",
      data: groupedData,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
