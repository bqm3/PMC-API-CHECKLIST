const { Tb_User_History, Ent_user, Ent_duan, Ent_chucvu } = require("../models/setup.model");
const sequelize = require("../config/db.config");

const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Tb_User_History.findAll({
      where: {
        ID_User: id,
        isDelete: 0,
      },
      include: [
        {
          model: Ent_duan,
          attributes: ["Duan"]
        },
        {
          model: Ent_chucvu,
          attributes: ["Chucvu"]
        },
      ],
    });
    res.status(200).json({
      message: "Thành công!",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = req.body;

    await Tb_User_History.create(data, { transaction: t });
    await Ent_user.update(
      {
        ID_Duan: data?.ID_Duan,
        ID_Chucvu: data?.ID_Chucvu,
      },
      {
        where: {
          ID_User: data.ID_User,
          isDelete: 0,
        },
        transaction: t,
      }
    );

    await t.commit();
    res.status(200).json({
      message: "Thành công!",
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.param.id;
    const data = req.body;

    await Tb_User_History.update(data, {
      where: {
        ID: id,
        isDelete: 0,
      },
      transaction: t,
    });

    await Ent_user.update(
      {
        ID_Duan: data?.ID_Duan,
        ID_Chucvu: data?.ID_Chucvu,
      },
      {
        where: {
          ID_User: data.ID_User,
          isDelete: 1,
        },
        transaction: t,
      }
    );

    await t.commit();

    res.status(200).json({
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  getUser,
  create,
  update,
};
