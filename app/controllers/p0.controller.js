const { P0, P0_Log, P0_User, Ent_user, Ent_chucvu, Ent_duan } = require("../models/setup.model");
const { Op } = require("sequelize");
const moment = require("moment");
const sequelize = require("../config/db.config");

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

    if (userData.ID_KhoiCV == 3) {
      generalData.ID_User_AN = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4) {
      generalData.ID_User_KT = userData.ID_User;
    } else {
      generalData.ID_User_AN = userData.ID_User;
      generalData.ID_User_KT = userData.ID_User;
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
      return res.status(400).json({ message: "Báo cáo P0 ngày hôm nay đã được tạo" });
    } else {
      if (data.Sotheotodk != undefined && userData.ID_KhoiCV != 4) {
        if (combinedData.Sotheotodk !== combinedData.Sltheoto + combinedData.Slxeoto + combinedData.Slxeotodien) {
          return res.status(400).json({
            message: "Số thẻ ô tô phát hành không khớp. Vui lòng kiểm tra lại số thẻ ô tô còn lại, số xe ô tô và số xe ô tô điện.",
          });
        }

        if (combinedData.Sothexemaydk !== combinedData.Slthexemay + combinedData.Slxemay + combinedData.Slxemaydien) {
          return res.status(400).json({
            message: "Số thẻ xe máy phát hành không khớp. Vui lòng kiểm tra lại số thẻ xe máy còn lại, số xe máy và số xe máy điện.",
          });
        }
      }

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

    if (data.Sotheotodk != undefined && userData.ID_KhoiCV != 4) {
      if (data.Sotheotodk !== data.Sltheoto + data.Slxeoto + data.Slxeotodien) {
        return res.status(400).json({
          message: "Số thẻ ô tô phát hành không khớp. Vui lòng kiểm tra lại số thẻ ô tô còn lại, số xe ô tô và số xe ô tô điện.",
        });
      }

      if (data.Sothexemaydk !== data.Slthexemay + data.Slxemay + data.Slxemaydien) {
        return res.status(400).json({
          message: "Số thẻ xe máy phát hành không khớp. Vui lòng kiểm tra lại số thẻ xe máy còn lại, số xe máy và số xe máy điện.",
        });
      }
    }

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

    if (userData.ID_KhoiCV == 3) {
      sanitizedData.ID_User_AN = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4) {
      sanitizedData.ID_User_KT = userData.ID_User;
    } else {
      sanitizedData.ID_User_AN = userData.ID_User;
      sanitizedData.ID_User_KT = userData.ID_User;
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

    if (userData.ID_KhoiCV == 3) {
      generalData.ID_User_AN_Update = userData.ID_User;
    } else if (userData.ID_KhoiCV == 4) {
      generalData.ID_User_KT_Update = userData.ID_User;
    } else {
      generalData.ID_User_AN_Update = userData.ID_User;
      generalData.ID_User_KT_Update = userData.ID_User;
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
