const { Ent_Hsse_User, Ent_user } = require("../../models/setup.model");
const { Op } = require("sequelize");

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
        { isDelete: 1},
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
    }else {
      return res.status(200).json({
        message: "Thành công",
        data: false,
      });
    }
  
  } catch (error) {
    return res.status(500).json({
      message: error.mesage || "Có lỗi xảy ra",
    });
  }
};
