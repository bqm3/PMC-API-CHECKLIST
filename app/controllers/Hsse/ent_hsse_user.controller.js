const {
  Ent_Hsse_User,
  Ent_user,
  HSSE_Log,
} = require("../../models/setup.model");
const { Op } = require("sequelize");
const moment = require("moment");
const hsse = require("../../models/hsse.model");
const sequelize = require("../../config/db.config");

exports.createHSSE = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userData = req.user.data;
    const data = req.body;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");

    // Convert null values to 0
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const dataUser = {
      Ten_du_an: userData?.ent_duan?.Duan,
      Ngay_ghi_nhan: Ngay_ghi_nhan,
      Nguoi_tao: userData?.Hoten || userData?.UserName,
      Email: userData?.Email,
      modifiedBy: "Checklist",
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
      return res
        .status(400)
        .json({ message: "Báo cáo HSSE ngày hôm nay đã được tạo" });
    } else {
      const createHSSE = await hsse.create(combinedData, { transaction: t });
      await funcHSSE_Log(req, createHSSE.ID, t);
      await t.commit();
      return res.status(200).json({
        message: "Tạo báo cáo HSSE thành công",
      });
    }
  } catch (error) {
    console.log("error", error);
    await t.rollback();
    res.status(500).json({ message: error?.message });
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
    console.log("error", error);
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
    console.log("error", error);
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
    const Ngay_ghi_nhan_truoc_do = moment(Ngay_ghi_nhan, "YYYY-MM-DD")
      .subtract(6, "days")
      .format("YYYY-MM-DD");
    const userData = req.user.data;
    const resData = await hsse.findAll({
      where: {
        Ten_du_an: userData?.ent_duan?.Duan,
        Ngay_ghi_nhan: {
          [Op.between]: [Ngay_ghi_nhan_truoc_do, Ngay_ghi_nhan],
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

exports.updateHSSE = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { Ngay } = req.body;
    const isToday = moment(Ngay).isSame(moment(), "day");

    if (!isToday) {
      await t.rollback();
      return res.status(400).json({
        message: "Có lỗi xảy ra! Ngày không đúng dữ liệu.",
      });
    }

    await funcHSSE_Log(req, req.params.id, t);
    await updateHSSE(req, req.params.id, t);
    await t.commit();

    return res.status(200).json({
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: error?.message || "Lỗi khi cập nhật HSSE.",
    });
  }
};


const updateHSSE = async (req, ID_HSSE, t) => {
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

const funcHSSE_Log = async (req, ID_HSSE, t) => {
  try {
    const userData = req.user.data;
    const { data } = req.body;
    const Ngay_ghi_nhan = moment(new Date()).format("YYYY-MM-DD");

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] === null ? 0 : data[key];
      return acc;
    }, {});

    const dataUser = {
      ID_HSSE: ID_HSSE,
      Ten_du_an: userData?.ent_duan?.Duan,
      Ngay_ghi_nhan: Ngay_ghi_nhan,
      Nguoi_sua: userData?.Hoten || userData?.UserName,
      Email: userData?.Email,
      modifiedBy: "Checklist",
    };
    const combinedData = { ...sanitizedData, ...dataUser };
    await HSSE_Log.create(combinedData, { transaction: t });
  } catch (error) {
    throw error;
  }
};
