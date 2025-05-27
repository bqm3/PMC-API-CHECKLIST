const { Ent_Hsse_User, Ent_user, HSSE_Log, Ent_duan } = require("../../models/setup.model");
const { getThamsophanhe } = require("./ent_thamsophanhe.controller");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");
const hsse = require("../../models/hsse.model");
const sequelize = require("../../config/db.config");
const { Expo } = require("expo-server-sdk");
const { QueryTypes } = require("sequelize");
const Lich_LamViec_PhanHe = require("../../models/Lich_LamViec_PhanHe.model");
const ExcelJS = require("exceljs");
const path = require("path");

// Khởi tạo một đối tượng Expo
let expo = new Expo();

const HSSE = [
  { id: 0, title: "Điện cư dân", key: "Dien_cu_dan", unit: "Kwh" },
  { id: 1, title: "Điện chủ đầu tư", key: "Dien_cdt", unit: "Kwh" },
  { id: 2, title: "Nước cư dân", key: "Nuoc_cu_dan", unit: "m³" },
  { id: 3, title: "Nước chủ đầu tư", key: "Nuoc_cdt", unit: "m³" },
  { id: 4, title: "Nước xả thải", key: "Xa_thai", unit: "m³" },
  { id: 5, title: "Rác sinh hoạt", key: "Rac_sh", unit: "m³" },
  { id: 6, title: "Muối điện phân", key: "Muoi_dp", unit: "" },
  { id: 7, title: "PAC", key: "PAC", unit: "" },
  { id: 8, title: "NaHSO3", key: "NaHSO3", unit: "" },
  { id: 9, title: "NaOH", key: "NaOH", unit: "" },
  { id: 10, title: "Mật rỉ đường", key: "Mat_rd", unit: "" },
  { id: 11, title: "Polymer Anion", key: "Polymer_Anion", unit: "" },
  { id: 12, title: "Chlorine bột", key: "Chlorine_bot", unit: "mg/l" },
  { id: 13, title: "Chlorine viên", key: "Chlorine_vien", unit: "" },
  { id: 14, title: "Methanol", key: "Methanol", unit: "" },
  { id: 15, title: "Dầu máy phát", key: "Dau_may", unit: "lít" },
  { id: 16, title: "Túi rác 240L", key: "Tui_rac240", unit: "kg" },
  { id: 17, title: "Túi rác 120L", key: "Tui_rac120", unit: "kg" },
  { id: 18, title: "Túi rác 20L", key: "Tui_rac20", unit: "kg" },
  { id: 19, title: "Túi rác 10L", key: "Tui_rac10", unit: "kg" },
  { id: 20, title: "Túi rác 5L", key: "Tui_rac5", unit: "kg" },
  { id: 21, title: "Giấy vệ sinh 235mm", key: "giayvs_235", unit: "cuộn" },
  { id: 22, title: "Giấy vệ sinh 120mm", key: "giaivs_120", unit: "cuộn" },
  { id: 23, title: "Giấy lau tay", key: "giay_lau_tay", unit: "bịch" },
  { id: 24, title: "Hóa chất làm sạch", key: "hoa_chat", unit: "lít" },
  { id: 25, title: "Nước rửa tay", key: "nuoc_rua_tay", unit: "lít" },
  { id: 26, title: "Nhiệt độ", key: "nhiet_do", unit: "°C" },
  { id: 27, title: "Nước bù bể", key: "nuoc_bu", unit: "m³" },
  { id: 28, title: "Clo", key: "clo", unit: "mg/l" },
  { id: 29, title: "Nồng độ PH", key: "PH", unit: "" },
  { id: 30, title: "Poolblock", key: "Poolblock", unit: "" },
  { id: 31, title: "Trạt thải", key: "trat_thai", unit: "kg" },
  { id: 32, title: "pH Minus", key: "pHMINUS", unit: "" },
  { id: 33, title: "Axit", key: "axit", unit: "" },
  { id: 34, title: "PN180", key: "PN180", unit: "" },
  {
    id: 35,
    title: "Chỉ số CO2",
    key: "chiSoCO2",
    unit: "PPM (part per million)",
  },
  { id: 36, title: "Clorin", key: "clorin", unit: "" },
  { id: 37, title: "NaOCL", key: "NaOCL", unit: "" },
  { id: 38, title: "Ghichu", key: "Ghichu", unit: "" },
];

exports.createHSSE = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const data = req.body;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");
    const yesterday = moment(Ngay_ghi_nhan).subtract(1, "days").format("YYYY-MM-DD");
    const thuSo = moment(Ngay_ghi_nhan).day();
    const thuSoDieuChinh = thuSo === 0 ? 7 : thuSo;

    // Convert null values to 0
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const dataUser = {
      Ten_du_an: userData?.ent_duan?.Duan,
      Ngay_ghi_nhan: Ngay_ghi_nhan,
      Nguoi_tao: userData?.UserName || userData?.Hoten,
      Email: userData?.Email,
      modifiedBy: "Checklist",
      ID_Ngay: thuSoDieuChinh,
    };

    const combinedData = { ...sanitizedData, ...dataUser };

    const findHsse = await hsse.findOne({
      attributes: ["Ten_du_an", "Ngay_ghi_nhan"],
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: Ngay_ghi_nhan,
      },
    });

    if (findHsse) {
      return res.status(400).json({ message: "Báo cáo HSSE ngày hôm nay đã được tạo" });
    } else {
      let htmlResponse = await funcYesterday(userData, data, yesterday, t, "Tạo báo cáo HSSE thành công.");

      // Token của thiết bị cần gửi thông báo
      let pushToken = "ExponentPushToken[tCg1IsCjTTXAM9Dg7PKpiu]";

      // Kiểm tra điều kiện trước khi gửi
      if (htmlResponse && userData?.ID_Duan == 2) {
        // Kiểm tra xem token có hợp lệ không
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(`Push token không hợp lệ: ${pushToken}`);
        } else {
          // Tạo nội dung thông báo
          let messages = [
            {
              to: pushToken,
              sound: "default",
              title: "Phòng số hóa",
              body: "Dự án anh có chỉ số tăng bất thường !",
            },
          ];

          // Gửi thông báo
          (async () => {
            try {
              let chunks = expo.chunkPushNotifications(messages);
              let tickets = [];

              for (let chunk of chunks) {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
              }

              console.log("Gửi thông báo thành công:", tickets);
            } catch (error) {
              console.error("Lỗi khi gửi thông báo:", error);
            }
          })();
        }
      }

      const xaThaiWarning = await funcXaThai(userData, combinedData);

      // Kết hợp cả 2 cảnh báo
      if (xaThaiWarning) {
        if (htmlResponse) {
          // Nếu đã có cảnh báo từ yesterday, thêm cảnh báo xả thải vào
          htmlResponse = htmlResponse.replace("</div>", `${xaThaiWarning}</div>`);
        } else {
          // Nếu chưa có cảnh báo từ yesterday, tạo mới htmlResponse
          htmlResponse = `
          <div>
            <h2>Cảnh báo:</h2>
            ${xaThaiWarning}
            <p>Tạo báo cáo HSSE thành công.</p>
          </div>`;
        }
      }

      const createHSSE = await hsse.create(combinedData, { transaction: t });
      await funcHSSE_Log(req, sanitizedData, createHSSE.ID, t);
      await t.commit();
      return res.status(200).json({
        message: "Tạo báo cáo HSSE thành công",
        htmlResponse: htmlResponse,
      });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error?.message });
  }
};

exports.updateHSSE = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const { data, Ngay } = req.body;
    const isToday = moment(Ngay).isSame(moment(), "day");
    const yesterday = moment(Ngay).subtract(1, "days").format("YYYY-MM-DD");

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    if (!isToday) {
      await t.rollback();
      return res.status(400).json({
        message: "Có lỗi xảy ra! Ngày không đúng dữ liệu.",
      });
    }

    let htmlResponse = await funcYesterday(userData, data, yesterday, t, "Cập nhật thành công !");

    const xaThaiWarning = await funcXaThai(userData, sanitizedData);

    // Kết hợp cả 2 cảnh báo
    if (xaThaiWarning) {
      if (htmlResponse) {
        // Nếu đã có cảnh báo từ yesterday, thêm cảnh báo xả thải vào
        htmlResponse = htmlResponse.replace("</div>", `${xaThaiWarning}</div>`);
      } else {
        // Nếu chưa có cảnh báo từ yesterday, tạo mới htmlResponse
        htmlResponse = `
        <div>
          <h2>Cảnh báo:</h2>
          ${xaThaiWarning}
          <p>Tạo báo cáo HSSE thành công.</p>
        </div>`;
      }
    }
    await funcHSSE_Log(req, data, req.params.id, t);
    await funUpdateHSSE(req, req.params.id, t);
    await t.commit();

    return res.status(200).json({
      message: "Cập nhật thành công!",
      htmlResponse: htmlResponse,
    });
  } catch (error) {
    await t.rollback();
    console.log("error", error);
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật HSSE.",
    });
  }
};

exports.createHSSE_PSH = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const data = req.body;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");
    const yesterday = moment(data.Ngay_ghi_nhan).subtract(1, "days").format("YYYY-MM-DD");

    // Convert null values to 0
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const thuSo = moment(data.Ngay_ghi_nhan).day();
    const thuSoDieuChinh = thuSo === 0 ? 7 : thuSo;

    const dataUser = {
      Ten_du_an: userData?.ent_duan?.Duan,
      Ghichu: data?.Ghichu || null,
      Ngay_ghi_nhan: data.Ngay_ghi_nhan,
      Nguoi_tao: userData?.UserName || userData?.Hoten,
      Email: userData?.Email,
      modifiedBy: "Checklist",
      ID_Ngay: thuSoDieuChinh,
    };

    const combinedData = { ...sanitizedData, ...dataUser };

    const findHsse = await hsse.findOne({
      attributes: ["Ten_du_an", "Ngay_ghi_nhan"],
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: data.Ngay_ghi_nhan,
      },
    });

    if (findHsse) {
      return res.status(400).json({ message: "Báo cáo HSSE ngày hôm nay đã được tạo" });
    } else {
      const htmlResponse = await funcYesterday(userData, data, yesterday, t, "Tạo báo cáo HSSE thành công.");
      const createHSSE = await hsse.create(combinedData, { transaction: t });
      // await funcHSSE_Log(req, sanitizedData, createHSSE.ID, t);
      await t.commit();
      return res.status(200).json({
        message: "Tạo báo cáo HSSE thành công",
        htmlResponse: htmlResponse,
      });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error?.message });
  }
};

exports.updateHSSE_PSH = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const { data, Ngay } = req.body;
    const isToday = moment(Ngay).isSame(moment(), "day");
    const yesterday = moment(Ngay).subtract(1, "days").format("YYYY-MM-DD");

    const htmlResponse = await funcYesterday(userData, data, yesterday, t, "Cập nhật thành công !");
    // await funcHSSE_Log(req, data, req.params.id, t);
    await funUpdateHSSE(req, req.params.id, t);
    await t.commit();

    return res.status(200).json({
      message: "Cập nhật thành công!",
      htmlResponse: htmlResponse,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật HSSE.",
    });
  }
};

exports.checkHSSE = async (req, res) => {
  try {
    const userData = req.user.data;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");

    const findHsse = await hsse.findOne({
      attributes: ["Ten_du_an", "Ngay_ghi_nhan"],
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: Ngay_ghi_nhan,
      },
    });
    if (findHsse) {
      return res.status(200).json({
        message: "Báo cáo HSSE ngày hôm nay đã tạo",
        show: false,
      });
    }
    return res.status(200).json({
      message: "Báo cáo HSSE chưa tạo",
      show: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.mesage || "Có lỗi xảy ra",
    });
  }
};

exports.createHSSE_User = async (req, res) => {
  try {
    const userData = req.user.data;
    const { ID_Users } = req.body;

    const check = await Ent_Hsse_User.findAll({
      where: {
        ID_Duan: userData.ID_Duan,
        isDelete: 0,
      },
    });

    const currentUsers = check.map((record) => record.ID_User);

    const toDelete = currentUsers.filter((id) => !ID_Users.includes(id));
    const toAdd = ID_Users.filter((id) => !currentUsers.includes(id));

    if (toDelete.length > 0) {
      await Ent_Hsse_User.update(
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
      await Ent_Hsse_User.bulkCreate(newEntries);
    }

    res.status(201).json({
      message: "Thành công",
      deletedUsers: toDelete,
      addedUsers: toAdd,
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

exports.getHSSE_User_ByDuAn = async (req, res) => {
  try {
    const userData = req.user.data;
    const userDuAn = await Ent_Hsse_User.findAll({
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

exports.checkSubmitHSSE = async (req, res) => {
  try {
    const userData = req.user.data;
    if (userData?.ent_chucvu?.Role == 1) {
      return res.status(200).json({
        message: "Thành công",
        data: true,
      });
    } else {
      const userDuAn = await Ent_Hsse_User.findOne({
        where: {
          ID_Duan: userData.ID_Duan,
          ID_User: userData.ID_User,
          isDelete: 0,
        },
      });

      if (userDuAn) {
        return res.status(201).json({
          message: "Thành công",
          data: true,
        });
      } else {
        return res.status(200).json({
          message: "Thành công",
          data: false,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: error.mesage || "Có lỗi xảy ra",
    });
  }
};

exports.getHSSE = async (req, res) => {
  try {
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");
    const Ngay_dau_thang = moment(Ngay_ghi_nhan, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD");
    const userData = req.user.data;
    const resData = await hsse.findAll({
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: {
          [Op.between]: [Ngay_dau_thang, Ngay_ghi_nhan],
        },
      },
      order: [["Ngay_ghi_nhan", "DESC"]],
    });
    return res.status(200).json({
      message: "Danh sách HSSE",
      data: resData || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

exports.getHSSEAll = async (req, res) => {
  try {
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");

    const resData = await hsse.findAll({
      where: {
        Ngay_ghi_nhan: Ngay_ghi_nhan,
      },
    });
    return res.status(200).json({
      message: "Danh sách HSSE",
      data: resData || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

exports.getDetailHSSE = async (req, res) => {
  try {
    const findHsse = await hsse.findOne({
      where: {
        ID: req.params.id,
      },
    });
    return res.status(200).json({
      message: "Báo cáo HSSE",
      data: findHsse,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.mesage || "Có lỗi xảy ra",
    });
  }
};

exports.getWarningHsseYesterday = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const thuSo = moment().isoWeekday(); // 1: Thứ 2 → 7: Chủ nhật

    const yesterday =
      thuSo === 1
        ? moment(today).subtract(3, "days").format("YYYY-MM-DD") // nếu Thứ 2 → lấy Thứ 6 tuần trước
        : moment(today).subtract(1, "days").format("YYYY-MM-DD");
    const yesterdayISO = moment(yesterday).isoWeekday();
    // 1. Lấy danh sách dự án có lịch làm việc hôm qua (join ent_duan để có tên)
    const duAnLamViecHomQua = await Lich_LamViec_PhanHe.findAll({
      attributes: ["ID_Duan", "ID_Phanhe", "ID_Ngay"],
      where: {
        ID_Phanhe: 1,
        ID_Ngay: yesterdayISO,
      },
      include: [
        {
          model: Ent_duan,
          as: "ent_duan",
          attributes: ["Duan", "ID_Duan"],
          required: true,
        },
      ],
      group: ["ID_Duan", "ent_duan.ID_Duan", "ent_duan.Duan"],
    });

    // 2. Tạo Set tên dự án có làm việc hôm qua
    const dsTenDuAnLamHomQua = new Set(duAnLamViecHomQua.map((item) => item.ent_duan.Duan));

    // 3. Lấy dữ liệu HSSE hôm nay và hôm qua
    const [todayHSSE, yesterdayHSSE] = await Promise.all([
      hsse.findAll({ where: { Ngay_ghi_nhan: today } }),
      hsse.findAll({ where: { Ngay_ghi_nhan: yesterday } }),
    ]);

    const result = {};

    for (const todayItem of todayHSSE) {
      const tenDuAn = todayItem.Ten_du_an;

      // Bỏ qua nếu hôm qua dự án này không làm việc
      if (!dsTenDuAnLamHomQua.has(tenDuAn)) continue;

      const yItem = yesterdayHSSE.find((item) => item.Ten_du_an === tenDuAn);
      if (!yItem) {
        continue;
      }
      const warnings = [];

      for (const { key, title, unit } of HSSE) {
        const todayValue = todayItem[key] || 0;
        const yesterdayValue = yItem[key] || 0;
        const diff = todayValue - yesterdayValue;

        let percentChange = 0;
        if (yesterdayValue === 0 && todayValue !== 0) {
          percentChange = 100;
        } else if (yesterdayValue !== 0) {
          percentChange = (diff / yesterdayValue) * 100;
        }

        const percentFormatted = percentChange.toFixed(2);

        // Tăng > 10%
        if (percentChange > 10) {
          warnings.push(
            `${title} hôm nay (${todayValue} ${unit || ""}) lớn hơn ${percentFormatted}% so với hôm qua là (${yesterdayValue} ${unit || ""})`
          );
        }

        // Giảm > 10%
        if (percentChange < -10) {
          warnings.push(
            `${title} hôm nay (${todayValue} ${unit || ""}) nhỏ hơn ${Math.abs(percentFormatted)}% so với hôm qua là (${yesterdayValue} ${
              unit || ""
            })`
          );
        }
      }

      if (warnings.length > 0) {
        result[tenDuAn] = warnings;
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

const funUpdateHSSE = async (req, ID_HSSE, t) => {
  try {
    const { data } = req.body;
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const result = await hsse.update(sanitizedData, {
      where: {
        ID: ID_HSSE,
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

const funcHSSE_Log = async (req, data, ID_HSSE, t) => {
  try {
    const userData = req.user.data;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const dataUser = {
      ID_HSSE: ID_HSSE,
      Ten_du_an: userData?.ent_duan?.Duan,
      Ngay_ghi_nhan: Ngay_ghi_nhan,
      Nguoi_sua: userData?.UserName || userData?.Hoten,
      Email: userData?.Email,
      modifiedBy: "Checklist",
    };
    const combinedData = { ...sanitizedData, ...dataUser };
    await HSSE_Log.create(combinedData, { transaction: t });
  } catch (error) {
    throw error;
  }
};

const funcYesterday = async (userData, data, yesterday, t, message) => {
  try {
    let warning = "";
    let htmlResponse = "";
    const yesterdayHSSE = await hsse.findOne({
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: yesterday,
      },
      transaction: t,
    });

    if (yesterdayHSSE) {
      Object.keys(data).forEach((key) => {
        if (key === "Ghichu") return;
        const currentValue = data[key];
        const yesterdayValue = yesterdayHSSE[key];
        const plus = currentValue - yesterdayValue;

        let percentIncrease;
        if (yesterdayValue == 0 && currentValue != 0) {
          percentIncrease = 100;
        } else {
          percentIncrease = ((plus / yesterdayValue) * 100).toFixed(2);
        }

        if (parseFloat(percentIncrease) > 15) {
          const hsseItem = HSSE.find((item) => item.key === key);
          warning += `<span><strong>${hsseItem.title}</strong> lớn hơn so với ${percentIncrease}% ngày hôm trước</span></br>`;
        }
      });
    }
    if (warning != "") {
      htmlResponse = `
    <div>
      ${`<h2>Cảnh báo:</h2>${warning}`}
      <p>${message}</p>
    </div>
`;
    }

    return htmlResponse;
  } catch (error) {
    throw error;
  }
};

// 20/03/2025 tạm thời lấy tb ở file excel

// * Cách tính mức xả thải trung bình của tất cả các dự án :
// Sau khi nhập xong chỉ số xả thải của ngày hiện tại thì :
// Mức xả thải trung bình = (Tổng mức xả thải các ngày (<ngày hiện tại)) /( Số ngày < ngày hiện tại))
// * Đối với các dự án không có giấy phép thì :
//  Mức xả thải theo giấy phép=( bằng tổng nước cư dân+nước chủ đầu tư  các ngày< ngày hiện tại) /(Số ngày<ngày hiện tại)

const funcXaThai = async (userData, combinedData) => {
  try {
    const dataReq = {
      ID_Duan: userData.ID_Duan,
      ID_Phanhe: 1,
      Thamso: "Xa_thai",
    };
    const Xa_thai = await getThamsophanhe(dataReq);

    let xaThaiWarning = "";
    if (Xa_thai) {
      if (combinedData.Xa_thai < Xa_thai.Chisotrungbinh * 0.9) {
        xaThaiWarning = `
            <div style="color: orange; margin: 10px 0; padding: 10px; border: 1px solid orange; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 8px;">⚠ Dự án kiểm tra mức xả thải dưới mức trung bình</p>
              <p>Kiểm tra đồng hồ đo, bơm (nếu có HT XLNT) hoặc hệ thống cấp nước (nếu không có HT XLNT).</p>
            </div>`;
      } else if (combinedData.Xa_thai > Xa_thai.Chisogiayphep * 1.1) {
        xaThaiWarning = `
            <div style="color: red; margin: 10px 0; padding: 10px; border: 1px solid red; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 8px;">⚠ Dự án kiểm tra mức xả thải vượt ngưỡng cho phép</p>
              <p>Kiểm tra van, bơm, hệ thống XLNT (nếu có) hoặc hệ thống cấp nước (nếu không có HT XLNT).</p>
            </div>`;
      }
    }
    return xaThaiWarning;
  } catch (error) {
    throw error;
  }
};

exports.canhBaoXaThai = async (req, res) => {
  try {
    const { Ngay } = req.query;

    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Timkiemthongkexathai(:Ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { Ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Có lỗi xảy ra khi gọi thủ tục",
    });
  }
};

exports.duan_khongnhap_xathai = async (req, res) => {
  try {
    const { p_ngay } = req.query;

    // Gọi stored procedure trong MySQL
    const result = await sequelize.query(
      "CALL Dsduan_khongnhap_xathai(:p_ngay)", // dùng CALL thay vì EXEC
      {
        replacements: { p_ngay },
        type: QueryTypes.RAW, // dùng RAW vì CALL trả về mảng nhiều lớp
      }
    );

    // Với CALL, kết quả thường nằm trong mảng đầu tiên
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Có lỗi xảy ra khi gọi thủ tục",
    });
  }
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "";
  // Handle string dates from your model
  if (typeof date === "string") {
    return date; // Return as is since it's already formatted
  }
  return new Date(date).toLocaleDateString("vi-VN");
};

// Helper function to create header with units
const createHeaderWithUnit = (title, unit) => {
  return unit ? `${title} (${unit})` : title;
};

exports.exportExcel = async (req, res) => {
  try {
    const userData = req.user.data;
    const { fromDate, toDate } = req.body;

    const data = await hsse.findAll({
      where: { Ngay_ghi_nhan: { [Op.between]: [fromDate, toDate] }, Ten_du_an: userData.ent_duan.Duan },
      order: [["Ngay_ghi_nhan", "ASC"]],
    });
    console.log("Found records:", data.length);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu trong khoảng thời gian đã chọn",
      });
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("HSSE Data Export");

    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 20;

    // Create headers
    const headers = ["STT", "Ngày ghi nhận", "Tên dự án", ...HSSE.map((item) => createHeaderWithUnit(item.title, item.unit))];

    // Add headers to worksheet
    const headerRow = worksheet.addRow(headers);

    // Style headers
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
        size: 11,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    data.forEach((record, index) => {
      const rowData = [
        index + 1, // STT
        formatDate(record.Ngay_ghi_nhan),
        record.Ten_du_an || "",
        ...HSSE.map((item) => {
          const value = record.dataValues ? record.dataValues[item.key] : record[item.key];
          // Handle different data types
          if (value === null || value === undefined) return "";
          if (typeof value === "number") return value;
          return value.toString();
        }),
      ];

      console.log("Row data sample:", index === 0 ? rowData : null);

      const dataRow = worksheet.addRow(rowData);

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber <= 4 ? "center" : "right", // Center for first 4 columns, right for data
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Alternate row colors
        if (index % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          };
        }
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 5; // STT column
      } else if (index === 1) {
        column.width = 15; // Date column
      } else if (index === 2) {
        column.width = 20; // Project name column
      } else if (index === 3) {
        column.width = 15; // Creator column
      } else {
        // Data columns - set width based on header length
        const header = headers[index];
        column.width = Math.min(Math.max(header.length + 2, 10), 25);
      }
    });

    // Generate filename
    const fromDateStr = fromDate.replace(/\//g, "-");
    const toDateStr = toDate.replace(/\//g, "-");
    const filename = `HSSE_Export_${fromDateStr}_to_${toDateStr}_${Date.now()}.xlsx`;

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({
      message: error.message || "Có lỗi xảy ra khi xuất Excel",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.importExcel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const file = req.file;

    // Check if file exists
    if (!file) {
      return res.status(400).json({
        message: "Vui lòng chọn file Excel để import",
      });
    }

    // Check file extension
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        message: "Chỉ chấp nhận file Excel (.xlsx, .xls)",
      });
    }

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    // Get first worksheet
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res.status(400).json({
        message: "File Excel không hợp lệ hoặc không có dữ liệu",
      });
    }

    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value ? cell.value.toString().trim() : '';
    });

    // Validate required headers
    const requiredHeaders = ["STT", "Ngày ghi nhận", "Tên dự án"];
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.includes(header))
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `File Excel thiếu các cột bắt buộc: ${missingHeaders.join(', ')}`,
      });
    }

    // Find column indexes
    const sttIndex = headers.findIndex(h => h.includes("STT"));
    const dateIndex = headers.findIndex(h => h.includes("Ngày ghi nhận"));
    const projectIndex = headers.findIndex(h => h.includes("Tên dự án"));

    // Map HSSE fields to column indexes
    const hsseFieldMap = {};
    HSSE.forEach(item => {
      const headerWithUnit = createHeaderWithUnit(item.title, item.unit);
      const columnIndex = headers.findIndex(h => h.includes(item.title));
      if (columnIndex !== -1) {
        hsseFieldMap[item.key] = columnIndex;
      }
    });

    // First pass: collect all dates to find min and max
    const allDates = [];
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (row.hasValues === false) continue;

      try {
        // Get date value
        const dateCell = row.getCell(dateIndex + 1);
        let dateValue;

        if (dateCell.value instanceof Date) {
          dateValue = dateCell.value;
        } else if (typeof dateCell.value === 'string') {
          // Try to parse date string (format: dd/mm/yyyy or similar)
          const dateParts = dateCell.value.trim().split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2]);
            dateValue = new Date(year, month, day);
          } else {
            dateValue = new Date(dateCell.value);
          }
        } else if (dateCell.value) {
          dateValue = new Date(dateCell.value);
        }

        if (dateValue && !isNaN(dateValue.getTime())) {
          allDates.push(dateValue);
        }
      } catch (error) {
        // Skip invalid dates in first pass
        continue;
      }
    }

    // Find min and max dates
    let minDate = null;
    let maxDate = null;
    if (allDates.length > 0) {
      minDate = new Date(Math.min(...allDates));
      maxDate = new Date(Math.max(...allDates));
    }

    // Format date range for Ghichu
    let dateRangeText = "Import Excel";
    if (minDate && maxDate) {
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      if (minDate.getTime() === maxDate.getTime()) {
        dateRangeText = `Tạo mới, cập nhật từ ngày ${formatDate(minDate)}`;
      } else {
        dateRangeText = `Tạo mới, cập nhật từ ngày ${formatDate(minDate)} đến ngày ${formatDate(maxDate)}`;
      }
    }

    // Process data rows
    const importResults = {
      total: 0,
      created: 0,
      updated: 0,
      errors: []
    };

    const rowPromises = [];

    // Start from row 2 (skip header)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (row.hasValues === false) continue;

      const processRow = async () => {
        try {
          // Get date value
          const dateCell = row.getCell(dateIndex + 1);
          let dateValue;

          if (dateCell.value instanceof Date) {
            dateValue = dateCell.value;
          } else if (typeof dateCell.value === 'string') {
            // Try to parse date string (format: dd/mm/yyyy or similar)
            const dateParts = dateCell.value.trim().split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const year = parseInt(dateParts[2]);
              dateValue = new Date(year, month, day);
            } else {
              dateValue = new Date(dateCell.value);
            }
          } else {
            throw new Error(`Ngày không hợp lệ tại dòng ${rowNumber}`);
          }

          if (isNaN(dateValue.getTime())) {
            throw new Error(`Ngày không hợp lệ tại dòng ${rowNumber}`);
          }

          const today = new Date();
          if (dateValue > today) {
             throw new Error(`Dòng ${rowNumber} không hợp lệ vì ngày ghi nhận lớn hơn ngày hiện tại`);
          }

          // Format date for database (YYYY-MM-DD)
          const formattedDate = dateValue.toISOString().split('T')[0];
          const thuSo = moment(formattedDate).day();
          const thuSoDieuChinh = thuSo === 0 ? 7 : thuSo;

          // Get project name
          const projectName = row.getCell(projectIndex + 1).value?.toString().trim() || userData.ent_duan.Duan;

          // Prepare data object
          const recordData = {
            Ngay_ghi_nhan: formattedDate,
            Ten_du_an: projectName,
            Nguoi_tao: userData?.UserName,
            Email: userData?.Email,
            modifiedBy: "Checklist",
            ID_Ngay: thuSoDieuChinh,
            Ghichu: dateRangeText
          };

          // Extract HSSE field values
          Object.keys(hsseFieldMap).forEach(fieldKey => {
            const columnIndex = hsseFieldMap[fieldKey];
            const cellValue = row.getCell(columnIndex + 1).value;
            
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
              // Convert to appropriate data type
              if (typeof cellValue === 'number') {
                recordData[fieldKey] = cellValue;
              } else if (typeof cellValue === 'string') {
                const numValue = parseFloat(cellValue.toString().replace(/,/g, ''));
                recordData[fieldKey] = isNaN(numValue) ? cellValue.toString() : numValue;
              } else {
                recordData[fieldKey] = cellValue.toString();
              }
            }
          });

          // Check if record exists for this date and project
          const existingRecord = await hsse.findOne({
            where: {
              Ngay_ghi_nhan: formattedDate,
              Ten_du_an: projectName
            }
          });

          if (existingRecord) {
            // Update existing record
            await existingRecord.update(recordData, { transaction: t });
            await funcHSSE_Log(req, recordData, existingRecord.ID, t);
            importResults.updated++;
          } else {
            // Create new record
            const newRecord = await hsse.create(recordData, { transaction: t });
            await funcHSSE_Log(req, recordData, newRecord.ID, t);
            importResults.created++;
          }

          importResults.total++;

        } catch (error) {
          importResults.errors.push({
            row: rowNumber,
            message: error.message
          });
        }
      };

      rowPromises.push(processRow());
    }

    // Wait for all rows to be processed
    await Promise.all(rowPromises);

    // Return results
    const response = {
      message: "Import hoàn thành",
      results: {
        totalProcessed: importResults.total,
        created: importResults.created,
        updated: importResults.updated,
        errors: importResults.errors.length
      }
    };

    if (importResults.errors.length > 0) {
      response.errors = importResults.errors;
      response.message += ` với ${importResults.errors.length} lỗi`;
    }

    await t.commit();
    return res.status(200).json(response);

  } catch (error) {
    await t.rollback();
    console.error("Excel import error:", error);
    res.status(500).json({
      message: error.message || "Có lỗi xảy ra khi import Excel",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};