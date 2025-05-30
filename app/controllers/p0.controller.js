const {
  P0,
  P0_Log,
  P0_User,
  Ent_user,
  Ent_chucvu,
  Ent_duan,
  Ent_chinhanh,
} = require("../models/setup.model");
const { Op, fn, col, where, QueryTypes } = require("sequelize");
const moment = require("moment");
const sequelize = require("../config/db.config");
const xlsx = require("xlsx");
var path = require("path");
const ExcelJS = require("exceljs");
const moment_timezone = require("moment-timezone");

exports.createP0_User = async (req, res) => {
  try {
    const userData = req.user.data;
    const { ID_Users } = req.body;

    if (userData?.ent_chucvu?.Role !== 1) {
      throw new Error("Bạn không có quyền thực hiện hành động này!");
    }

    const check = await P0_User.findAll({
      where: {
        ID_Duan: userData.ID_Duan,
        isDelete: 0,
      },
    });

    const currentUsers = check.map((record) => record.ID_User);
    const toDelete = currentUsers.filter((id) => !ID_Users.includes(id));
    const toAdd = ID_Users.filter((id) => !currentUsers.includes(id));

    if (toDelete.length > 0) {
      await P0_User.update(
        { isDelete: 1 },
        {
          where: {
            ID_User: { [Op.in]: toDelete },
            ID_Duan: userData.ID_Duan,
          },
        }
      );
    }

    if (toAdd.length > 0) {
      const newEntries = toAdd.map((ID_User) => ({
        ID_Duan: userData.ID_Duan,
        ID_User,
      }));
      await P0_User.bulkCreate(newEntries);
    }

    res.status(201).json({
      message: "Thành công",
      deletedUsers: toDelete,
      addedUsers: toAdd,
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: error?.message });
  }
};

exports.getP0_User_ByDuAn = async (req, res) => {
  try {
    const userData = req.user.data;
    const userDuAn = await P0_User.findAll({
      where: {
        ID_Duan: userData.ID_Duan,
        isDelete: 0,
      },
    });
    if (userDuAn) {
      return res.status(201).json({
        message: "Thành công",
        data: userDuAn,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

exports.getDetailP0 = async (req, res) => {
  try {
    const findP0 = await P0.findOne({
      where: {
        ID_P0: req.params.id,
        isDelete: 0,
      },
    });

    return res.status(200).json({
      message: "Báo cáo P0",
      data: findP0,
      include: [
        {
          model: Ent_user,
          as: "ent_user_AN",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_user,
          as: "ent_user_DV",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_user,
          as: "ent_user_KT",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_duan,
          as: "ent_duan",
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.mesage || "Có lỗi xảy ra",
    });
  }
};

exports.checkRole = async (req, res) => {
  try {
    const userData = req.user?.data;
    if (!userData) {
      return res.status(400).json({
        message: "Dữ liệu người dùng không hợp lệ",
        data: false,
      });
    }

    if (userData.ent_chucvu?.Role === 1) {
      return res.status(200).json({
        message: "Thành công",
        data: true,
      });
    }

    const userDuAn = await P0_User.findOne({
      where: {
        ID_Duan: userData.ID_Duan,
        ID_User: userData.ID_User,
        isDelete: 0,
      },
    });

    if (userDuAn) {
      return res.status(200).json({
        message: "Thành công",
        data: true,
      });
    } else {
      return res.status(200).json({
        message: "Không tìm thấy người dùng trong dự án",
        data: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
      data: false,
    });
  }
};

exports.createP0 = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const data = req.body;
    const Ngaybc = moment(new Date()).format("YYYY-MM-DD");

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const generalData = {
      ID_Duan: userData?.ID_Duan,
      Ngaybc: Ngaybc,
      isDelete: 0,
    };

    const arrKhoiParsed = userData?.arr_Khoi?.split(",").map(Number);

    if (userData?.isCheckketoan === 1) {
      generalData.ID_User_KT = userData.ID_User;
    }
    if (userData.ID_KhoiCV == 3 || arrKhoiParsed?.includes(3)) {
      generalData.ID_User_AN = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4 || arrKhoiParsed?.includes(4)) {
      generalData.ID_User_DV = userData.ID_User;
    } else if (userData?.ent_chucvu?.Role == 1) {
      generalData.ID_User_AN = userData.ID_User;
      generalData.ID_User_KT = userData.ID_User;
      generalData.ID_User_DV = userData.ID_User;
    }

    const combinedData = { ...sanitizedData, ...generalData };
    const findP0 = await P0.findOne({
      attributes: ["ID_P0", "ID_Duan", "Ngaybc"],
      where: {
        ID_Duan: userData?.ID_Duan,
        Ngaybc: Ngaybc,
        isDelete: 0,
      },
    });

    if (findP0) {
      return res
        .status(400)
        .json({ message: "Báo cáo P0 ngày hôm nay đã được tạo" });
    } else {
      const createP0 = await P0.create(combinedData, { transaction: t });
      await funcP0_Log(req, sanitizedData, createP0.ID_P0, t);
      await t.commit();
      return res.status(200).json({
        message: "Tạo báo cáo P0 thành công",
      });
    }
  } catch (error) {
    console.log("error", error);
    await t.rollback();
    res.status(500).json({ message: error?.message });
  }
};

exports.getAll_ByID_Duan = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.limit) || 7;
    const offset = page * pageSize;

    const count = await P0.count({
      where: {
        ID_Duan: userData?.ID_Duan,
        isDelete: 0,
      },
    });

    const findAll = await P0.findAll({
      where: {
        ID_Duan: userData?.ID_Duan,
        isDelete: 0,
      },
      include: [
        {
          model: Ent_user,
          as: "ent_user_AN",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_user,
          as: "ent_user_DV",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_user,
          as: "ent_user_KT",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [
            {
              model: Ent_chucvu,
              attributes: ["Chucvu", "Role"],
            },
          ],
        },
        {
          model: Ent_duan,
          as: "ent_duan",
        },
      ],
      order: [["Ngaybc", "DESC"]],
      offset: offset,
      limit: pageSize,
    });

    return res.status(200).json({
      message: "Lấy dữ liệu P0 thành công",
      data: findAll,
      count: count,
    });
  } catch (error) {
    console.log("error", error.message);
    await t.rollback();
    return res.status(500).json({
      message: error?.message || "Có lỗi xảy ra khi lấy thông tin",
    });
  }
};

exports.updateP0 = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const { data, Ngay } = req.body;
    const isToday = moment(Ngay).isSame(moment(), "day");

    if (!isToday) {
      await t.rollback();
      return res.status(400).json({
        message: "Có lỗi xảy ra! Ngày không đúng dữ liệu.",
      });
    }

    // if (data.Sotheotodk != undefined && userData.ID_KhoiCV != 4) {
    //   if (data.Sotheotodk !== data.Sltheoto + data.Slxeoto + data.Slxeotodien) {
    //     return res.status(400).json({
    //       message: "Số thẻ ô tô phát hành không khớp. Vui lòng kiểm tra lại số thẻ ô tô còn lại, số xe ô tô và số xe ô tô điện.",
    //     });
    //   }

    //   if (data.Sothexemaydk !== data.Slthexemay + data.Slxemay + data.Slxemaydien) {
    //     return res.status(400).json({
    //       message: "Số thẻ xe máy phát hành không khớp. Vui lòng kiểm tra lại số thẻ xe máy còn lại, số xe máy và số xe máy điện.",
    //     });
    //   }
    // }

    await funcP0_Log(req, data, req.params.id, t);
    await updateP0(req, req.params.id, t);
    await t.commit();

    return res.status(200).json({
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật P0.",
    });
  }
};

const updateP0 = async (req, ID_P0, t) => {
  try {
    const userData = req.user.data;
    const { data } = req.body;
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const arrKhoiParsed = userData?.arr_Khoi?.split(",").map(Number);

    if (userData?.isCheckketoan === 1) {
      sanitizedData.ID_User_KT = userData.ID_User;
    }

    if (userData.ID_KhoiCV == 3 || arrKhoiParsed?.includes(3)) {
      sanitizedData.ID_User_AN = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4 || arrKhoiParsed?.includes(4)) {
      sanitizedData.ID_User_DV = userData.ID_User;
    } else if (userData?.ent_chucvu?.Role == 1) {
      sanitizedData.ID_User_AN = userData.ID_User;
      sanitizedData.ID_User_KT = userData.ID_User;
      sanitizedData.ID_User_DV = userData.ID_User;
    }

    const result = await P0.update(sanitizedData, {
      where: {
        ID_P0: ID_P0,
        iTrangthai: 0,
        isDelete: 0,
      },
      transaction: t,
    });

    if (result[0] === 0) {
      throw new Error("Không tìm thấy dự án để cập nhật.");
    }
  } catch (err) {
    throw err;
  }
};

const funcP0_Log = async (req, data, ID_P0, t) => {
  try {
    const userData = req.user.data;
    const Ngaybc = moment(new Date()).format("YYYY-MM-DD");
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const generalData = {
      ID_P0: ID_P0,
      ID_Duan: userData?.ID_Duan,
      Ngaybc: Ngaybc,
    };

    if (userData?.isCheckketoan === 1) {
      generalData.ID_User_KT_Update = userData.ID_User;
    }
    if (userData.ID_KhoiCV == 3) {
      generalData.ID_User_AN_Update = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4) {
      generalData.ID_User_DV_Update = userData.ID_User;
    } else if (userData?.ent_chucvu?.Role == 1) {
      generalData.ID_User_AN_Update = userData.ID_User;
      generalData.ID_User_KT_Update = userData.ID_User;
      generalData.ID_User_DV_Update = userData.ID_User;
    }

    const combinedData = { ...sanitizedData, ...generalData };
    await P0_Log.create(combinedData, { transaction: t });
  } catch (error) {
    throw error;
  }
};

exports.get_SoThePhatHanh = async (req, res) => {
  try {
    const userData = req.user.data;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    // Trước tiên tìm dữ liệu của ngày hôm nay
    let data = await P0.findOne({
      attributes: ["Sotheotodk", "Sothexemaydk"],
      where: {
        ID_Duan: userData?.ID_Duan,
        Ngaybc: today,
        isDelete: 0,
      },
    });

    // Nếu không có dữ liệu ngày hôm nay, tìm ngày gần nhất có dữ liệu
    if (!data) {
      data = await P0.findOne({
        attributes: ["Sotheotodk", "Sothexemaydk"],
        where: {
          ID_Duan: userData?.ID_Duan,
          Ngaybc: {
            [Op.lt]: today, // Tìm các ngày trước today
          },
          isDelete: 0,
        },
        order: [["Ngaybc", "DESC"]], // Sắp xếp theo ngày giảm dần để lấy ngày gần nhất
      });
    }

    // Nếu vẫn không có dữ liệu, trả về giá trị mặc định
    if (!data) {
      data = { Sotheotodk: "0", Sothexemaydk: "0" };
    } else {
      // Nếu có dữ liệu nhưng bị null, gán lại giá trị "0"
      data.Sotheotodk = data.Sotheotodk ?? "0";
      data.Sothexemaydk = data.Sothexemaydk ?? "0";
    }

    return res.status(200).json({
      message: "Số thẻ phát hành",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật P0.",
    });
  }
};

exports.uploadPheduyet = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Kiểm tra xem file có được upload không
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload file Excel" });
    }

    // Đọc file Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const worksheet = workbook.Sheets[sheetName];

    // Chuyển dữ liệu từ sheet thành JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "File Excel không có dữ liệu" });
    }

    // Danh sách các cột trong bảng PheDuyetOnline
    const columns = [
      "ID",
      "Ten_yc",
      "ngaytao",
      "Loai_yc",
      "Ten_toanha",
      "TenDA",
      "Tinhtrang",
      "KetoanTN",
      "GDCN",
      "KTCD",
      "KTCQD",
      "PGDTC",
      "GDTC",
      "BGDPMC",
      "BQT",
      "giai_trinh",
      "sotien",
      "nguoi_th",
      "so_dntt",
      "khoanmuc",
      "so_hd",
      "ma_ngansach",
      "ten_hd",
      "chiphi_pmc",
      "chiphi_chiho",
      "chiphi_baotri",
      "chiphi_qvh",
      "nguoi_denghi",
      "hinhthuc_tt",
      "nganhang",
      "sotk",
      "han_tt",
      "ngay_denghi",
      "LinkFile",
      "nguoi_gui",
      "Da_duyet",
      "Chinhanh",
      "LoaiDV",
      "NhaCC",
      "DocusignID",
    ];

    // Ánh xạ tiêu đề cột từ Excel sang tên cột trong bảng
    const columnMapping = {
      MySQLID: "ID",
      "Tên yêu cầu duyệt": "Ten_yc",
      "Ngày tạo": "ngaytao",
      "Loại yêu cầu": "Loai_yc",
      "Tên tòa nhà": "Ten_toanha",
      "Tên dự án": "TenDA",
      "Tình trạng": "Tinhtrang",
      "Kế toán TN": "KetoanTN",
      "Giám đốc chi nhánh": "GDCN",
      "Kế toán chuyên quản": "KTCD",
      "Kế toán chuyên quản duyệt": "KTCQD",
      PGDTC: "PGDTC",
      GDTC: "GDTC",
      "Ban giám đốc PMC": "BGDPMC",
      "Trưởng ban quản trị": "BQT",
      "Giải trình thêm": "giai_trinh",
      "Số tiền": "sotien",
      "Người thụ hưởng": "nguoi_th",
      "Đề nghị thanh toán số": "so_dntt",
      "Khoản mục chi phí": "khoanmuc",
      "Số hóa đơn": "so_hd",
      "Mã ngân sách": "ma_ngansach",
      "Tên hợp đồng": "ten_hd",
      "Chi phí PMC": "chiphi_pmc",
      "Chi phí chi hộ": "chiphi_chiho",
      "Chi phí quỹ bảo trì": "chiphi_baotri",
      "Chi phí QVH": "chiphi_qvh",
      "Người đề nghị": "nguoi_denghi",
      "Hình thức thanh toán": "hinhthuc_tt",
      "Ngân hàng": "nganhang",
      "Số tài khoản": "sotk",
      "Hạn thanh toán": "han_tt",
      "Ngày đề nghị": "ngay_denghi",
      "Link file": "LinkFile",
      "Người gửi yêu cầu": "nguoi_gui",
      "Đã duyệt": "Da_duyet",
      "Chi nhánh": "Chinhanh",
      "Loại dịch vụ": "LoaiDV",
      "Nhà cung cấp": "NhaCC",
      "Docusign ID": "DocusignID",
    };

    // Chuẩn bị câu lệnh SQL để chèn dữ liệu
    const insertQuery = `
          INSERT INTO PheDuyetOnline (
              ${columns.join(", ")}
          ) VALUES (
              ${columns.map(() => "?").join(", ")}
          )
      `;

    // Duyệt qua từng dòng dữ liệu và chèn vào cơ sở dữ liệu
    for (const row of data.slice(0, 50)) {
      const values = columns.map((column) => {
        // Ánh xạ tiêu đề cột từ Excel sang tên cột trong bảng
        const excelColumn = Object.keys(columnMapping).find(
          (key) => columnMapping[key] === column
        );

        // Lấy giá trị từ dòng Excel, giữ nguyên dưới dạng chuỗi
        let value = row[excelColumn] || null;

        // Nếu giá trị là số hoặc kiểu khác, chuyển thành chuỗi
        if (value !== null && typeof value !== "string") {
          value = String(value);
        }

        return value;
      });

      await sequelize.query(insertQuery, {
        replacements: values,
        type: sequelize.QueryTypes.INSERT,
        transaction,
      });
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Import dữ liệu thành công", totalRows: data.length });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi import dữ liệu:", error);
    res.status(500).json({
      message: "Đã có lỗi xảy ra khi import dữ liệu",
      error: error.message,
    });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const user = req.user.data;
    const month = req.query.month;
    const year = req.query.year;

    // Fetch data from DB (unchanged)
    const data = await P0.findAll({
      where: {
        ID_Duan: user.ID_Duan,
        isDelete: 0,
        [Op.and]: [
          where(fn("MONTH", col("P0.createdAt")), month),
          where(fn("YEAR", col("P0.createdAt")), year),
        ],
      },
      include: [
        {
          model: Ent_user,
          as: "ent_user_AN",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [{ model: Ent_chucvu, attributes: ["Chucvu", "Role"] }],
        },
        {
          model: Ent_user,
          as: "ent_user_DV",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [{ model: Ent_chucvu, attributes: ["Chucvu", "Role"] }],
        },
        {
          model: Ent_user,
          as: "ent_user_KT",
          attributes: ["ID_User", "Hoten", "ID_Chucvu"],
          include: [{ model: Ent_chucvu, attributes: ["Chucvu", "Role"] }],
        },
        {
          model: Ent_duan,
          as: "ent_duan",
        },
      ],
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo Cáo Chi Tiết", {
      properties: {
        tabColor: { argb: "FF00FF00" },
        defaultRowHeight: 25,
        defaultColWidth: 15,
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      },
    });

    // Add title row with gradient background
    worksheet.mergeCells("A1:AF1");
    const titleCell = worksheet.getCell("A1");
    const projectName = data[0]?.ent_duan?.Duan
      ? data[0].ent_duan.Duan.toUpperCase()
      : "KHÔNG XÁC ĐỊNH";
    titleCell.value = `BÁO CÁO S0 DỰ ÁN ${projectName} - THÁNG ${month}/${year}`;

    console.log(":titleCell.value", titleCell.value);
    titleCell.font = {
      name: "Arial",
      size: 18,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    titleCell.fill = {
      type: "gradient",
      gradient: "angle",
      degree: 0,
      stops: [
        { position: 0, color: { argb: "4472C4" } },
        { position: 1, color: { argb: "1F4E78" } },
      ],
    };
    titleCell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    titleCell.border = {
      top: { style: "thin", color: { argb: "4472C4" } },
      left: { style: "thin", color: { argb: "4472C4" } },
      bottom: { style: "thin", color: { argb: "4472C4" } },
      right: { style: "thin", color: { argb: "4472C4" } },
    };

    // Add subtitle with date
    worksheet.mergeCells("A2:AF2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = `Ngày xuất báo cáo: ${moment().format(
      "DD/MM/YYYY HH:mm:ss"
    )}`;
    subtitleCell.font = {
      name: "Arial",
      size: 12,
      italic: true,
      color: { argb: "666666" },
    };
    subtitleCell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    // Define comprehensive column headers
    const headers = [
      { header: "STT", key: "stt", width: 6 },
      { header: "Ngày Báo Cáo", key: "Ngaybc", width: 15 },
      { header: "An Ninh", key: "AnNinh", width: 15 },
      { header: "Kế Toán", key: "KeToan", width: 20 },
      { header: "Dịch Vụ", key: "DichVu", width: 20 },
      { header: "Số Xe Ô Tô", key: "Slxeoto", width: 15 },
      { header: "Số Xe Ô Tô Điện", key: "Slxeotodien", width: 15 },
      { header: "Số Xe Máy", key: "Slxemay", width: 15 },
      { header: "Số Xe Máy Điện", key: "Slxemaydien", width: 15 },
      { header: "Số Xe Đạp", key: "Slxedap", width: 15 },
      { header: "Số Xe Đạp Điện", key: "Slxedapdien", width: 15 },
      { header: "Số Thẻ Ô Tô Đăng Ký", key: "Sotheotodk", width: 20 },
      { header: "Số Thẻ Ô Tô Còn Lại", key: "Sltheoto", width: 20 },
      { header: "Số Thẻ Ô Tô Phần Mềm", key: "Sltheotophanmem", width: 20 },
      { header: "Số Thẻ Xe Máy Đăng Ký", key: "Sothexemaydk", width: 20 },
      { header: "Số Thẻ Xe Máy Còn Lại", key: "Slthexemay", width: 20 },
      { header: "Số Thẻ Xe Máy Phần Mềm", key: "Slthexemayphanmem", width: 20 },
      { header: "Sự Cố Ô Tô", key: "Slscoto", width: 20 },
      { header: "Sự Cố Ô Tô Điện", key: "Slscotodien", width: 20 },
      { header: "Sự Cố Xe Máy", key: "Slscxemay", width: 20 },
      { header: "Sự Cố Xe Máy Điện", key: "Slscxemaydien", width: 20 },
      { header: "Sự Cố Xe Đạp", key: "Slscxedap", width: 20 },
      { header: "Sự Cố Xe Đạp Điện", key: "Slscxedapdien", width: 20 },
      { header: "Sự Cố Khác", key: "Slsucokhac", width: 20 },
      { header: "Công Tơ Điện", key: "Slcongto", width: 20 },
      { header: "Quân Số Thực Tế", key: "QuansoTT", width: 20 },
      { header: "Quân Số Định Biên", key: "QuansoDB", width: 20 },
      { header: "Doanh Thu", key: "Doanhthu", width: 20 },
      { header: "Ghi Chú", key: "Ghichu", width: 30 },
      { header: "Ngày Tạo", key: "createdAt", width: 20 },
      { header: "Ngày Cập Nhật", key: "updatedAt", width: 20 },
    ];

    worksheet.columns = headers.map((header) => ({
      key: header.key,
      width: header.width,
    }));

    // Thêm header thủ công vào hàng 3
    const headerRow = worksheet.getRow(3);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header.header; // Gán giá trị header
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "4472C4" } },
        left: { style: "thin", color: { argb: "4472C4" } },
        bottom: { style: "thin", color: { argb: "4472C4" } },
        right: { style: "thin", color: { argb: "4472C4" } },
      };
    });

    // Add data rows with improved formatting
    data.forEach((row, index) => {
      const excelRow = {
        stt: index + 1, // Add sequential number
        Ngaybc: row.Ngaybc ? moment(row.Ngaybc).format("DD/MM/YYYY") : "N/A",

        // User IDs and Names
        AnNinh: row.ent_user_AN ? row.ent_user_AN.Hoten : "Chưa có",
        KeToan: row.ent_user_KT ? row.ent_user_KT.Hoten : "Chưa có",
        DichVu: row.ent_user_DV ? row.ent_user_DV.Hoten : "Chưa có",

        // Vehicle Statistics
        Slxeoto: row.Slxeoto || 0,
        Slxeotodien: row.Slxeotodien || 0,
        Slxemay: row.Slxemay || 0,
        Slxemaydien: row.Slxemaydien || 0,
        Slxedap: row.Slxedap || 0,
        Slxedapdien: row.Slxedapdien || 0,

        // Card Statistics
        Sotheotodk: row.Sotheotodk || 0,
        Sltheoto: row.Sltheoto || 0,
        Sltheotophanmem: row.Sltheotophanmem || 0,
        Sothexemaydk: row.Sothexemaydk || 0,
        Slthexemay: row.Slthexemay || 0,
        Slthexemayphanmem: row.Slthexemayphanmem || 0,

        // Incident Statistics
        Slscoto: row.Slscoto || 0,
        Slscotodien: row.Slscotodien || 0,
        Slscxemay: row.Slscxemay || 0,
        Slscxemaydien: row.Slscxemaydien || 0,
        Slscxedap: row.Slscxedap || 0,
        Slscxedapdien: row.Slscxedapdien || 0,
        Slsucokhac: row.Slsucokhac || 0,

        // Additional Statistics
        Slcongto: row.Slcongto || 0,
        QuansoTT: row.QuansoTT || 0,
        QuansoDB: row.QuansoDB || 0,

        // Status and Revenue
        Doanhthu: row.Doanhthu
          ? row.Doanhthu.toLocaleString("vi-VN") + " VND"
          : "0 VND",
        Ghichu: row.Ghichu || "Không có ghi chú",

        // Timestamp Information
        createdAt: row.createdAt
          ? moment(row.createdAt).format("DD/MM/YYYY HH:mm:ss")
          : "N/A",
        updatedAt: row.updatedAt
          ? moment(row.updatedAt).format("DD/MM/YYYY HH:mm:ss")
          : "N/A",
      };

      const worksheetRow = worksheet.addRow(excelRow);

      // Style all cells in the row
      worksheetRow.eachCell((cell) => {
        cell.font = {
          name: "Arial",
          size: 10,
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "E0E0E0" } },
          left: { style: "thin", color: { argb: "E0E0E0" } },
          bottom: { style: "thin", color: { argb: "E0E0E0" } },
          right: { style: "thin", color: { argb: "E0E0E0" } },
        };
      });

      // Style specific columns
      worksheetRow.getCell("stt").font = { bold: true };
      worksheetRow.getCell("Ngaybc").numFmt = "dd/mm/yyyy";
      worksheetRow.getCell("Doanhthu").numFmt = '#,##0" VND"';

      // Apply alternating row colors with softer colors
      if (index % 2 === 1) {
        worksheetRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F8F9FA" },
          };
        });
      }
    });

    // Add footer with total row
    const lastRow = worksheet.rowCount;
    worksheet.mergeCells(`A${lastRow + 1}:AF${lastRow + 1}`);
    const footerCell = worksheet.getCell(`A${lastRow + 1}`);
    footerCell.value = `Tổng số bản ghi: ${data.length}`;
    footerCell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "4472C4" },
    };
    footerCell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    // Adjust column widths based on content
    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width, 15);
    });

    // Add page setup
    worksheet.pageSetup.paperSize = 9;
    worksheet.pageSetup.orientation = "landscape";
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0;

    // Add print area
    worksheet.pageSetup.printArea = `A1:AF${lastRow + 1}`;

    // Add header and footer for printing
    worksheet.headerFooter.oddHeader = "&C&B&18BÁO CÁO S0 DỰ ÁN";
    worksheet.headerFooter.oddFooter = "&C&D&10Trang &P/&N";

    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for file download (unchanged)
    const filename =
      `BaoCao_${data[0]?.ent_duan?.Duan}_Thang${month}_Nam${year}.xlsx`
        .replace(/\s+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send Excel file to client
    res.send(buffer);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi xuất file",
      error: error.message,
    });
  }
};

exports.analytics = async (req, res) => {
  try {
    const yesterday = moment_timezone()
      .tz("Asia/Ho_Chi_Minh")
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const type = parseInt(req.params.id, 10);
    let respone = "";
    switch (type) {
      case 1:
        respone = await phan1P0(yesterday);
        break;
      case 2:
        respone = await phan2P0(yesterday);
        break;
      case 3:
        respone = await phan3_1P0(yesterday);
        break;
      case 4:
        respone = await phan3_2_P0_CacDuAnKhongNhapXe(yesterday);
        break;
      case 5:
        respone = await phan4P0(yesterday);
        break;
      case 6:
        respone = await get7DaysPhanP0(yesterday);
        break;
      case 7:
        respone = await get_DuanChuaTrienKhai();
        break;
    }

    res.status(200).json(respone);
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật P0.",
    });
  }
};

const phan1P0 = async (inputDate) => {
  try {
    const dayBeforeYesterday = moment()
      .tz("Asia/Ho_Chi_Minh")
      .subtract(2, "days")
      .format("YYYY-MM-DD");

    // Gọi stored procedure trong MySQL
    const resultYesterday = await sequelize.query(
      "CALL Phan1P0(:inputDate)", // dùng CALL thay vì EXEC
      {
        replacements: { inputDate },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    const resultDayBefore = await sequelize.query(
      "CALL Phan1P0(:inputDate)", // dùng CALL thay vì EXEC
      {
        replacements: { inputDate: dayBeforeYesterday },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return {
      yesterday: resultYesterday[0],
      dayBeforeYesterday: resultDayBefore[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const phan2P0 = async (p_Ngay) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Phan2P0(:p_Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    const data = result;
    const thuaThe = data.filter((item) => item.Nhom === "Thừa thẻ");
    const thieuThe = data.filter((item) => item.Nhom === "Thiếu thẻ");
    return {
      thuaThe,
      thieuThe,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const get_DuanChuaTrienKhai = async () => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query("CALL  sp_GetDuAnChuaTrienKhai", {
      type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const phan3_1P0 = async (NgayBC_input) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Phan3_1P0(:NgayBC_input)", // dùng CALL thay vì EXEC
      {
        replacements: { NgayBC_input },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên

    return result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

const phan3_2_P0_CacDuAnKhongNhapXe = async (NgayBC_input) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Phan3_2_P0_CacDuAnKhongNhapXe(:NgayBC_input)", // dùng CALL thay vì EXEC
      {
        replacements: { NgayBC_input },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const phan4P0 = async (inputDate) => {
  try {
    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Phan4P0(:inputDate)", // dùng CALL thay vì EXEC
      {
        replacements: { inputDate },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên

    const duanCountByChiNhanh = await Ent_duan.findAll({
      attributes: [
        [fn("COUNT", col("ent_duan.Duan")), "soLuongDuan"],
        [col("ent_chinhanh.Tenchinhanh"), "Tenchinhanh"],
      ],
      where: {
        isDelete: 0,
        ID_Duan: {
          [Op.notIn]: [1, 140],
        },
        P0: 1,
      },
      include: [
        {
          model: Ent_chinhanh,
          as: "ent_chinhanh",
          attributes: [],
        },
      ],
      group: ["ent_chinhanh.Tenchinhanh"],
    });

    const allChiNhanhData = duanCountByChiNhanh.map((item) => ({
      label: item.get("Tenchinhanh"),
      count: parseInt(item.get("soLuongDuan")),
    }));

    const formattedResult = result.map((item) => ({
      label: item.Tenchinhanh,
      value: item.SoLuongDuan,
    }));

    const formattedMap = Object.fromEntries(
      formattedResult.map((item) => [item.label, item.value])
    );

    const resultWithRatio = allChiNhanhData.map((item) => {
      const valueInFormatted = formattedMap[item.label] ?? 0;
      return {
        label: item.label,
        value: `${valueInFormatted}/${item.count}`,
      };
    });

    return resultWithRatio;
  } catch (error) {
    throw new Error(error.message);
  }
};

const phanP0 = async (inputDate) => {
  try {
    // Gọi stored procedure trong MySQL
    const resultYesterday = await sequelize.query(
      "CALL Phan1P0(:inputDate)", // dùng CALL thay vì EXEC
      {
        replacements: { inputDate },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    return {
      inputDate: resultYesterday[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const get7DaysPhanP0 = async () => {
  const results = [];
  const promises = [];

  // Create array of promises for parallel processing
  for (let i = 0; i < 7; i++) {
    const date = moment_timezone()
      .subtract(i + 1, "days")
      .format("YYYY-MM-DD");
    promises.push(
      phanP0(date)
        .then((result) => ({
          date,
          data: result.inputDate,
        }))
        .catch((err) => ({
          date,
          error: err.message,
        }))
    );
  }

  // Wait for all promises to resolve
  return await Promise.all(promises);
};
