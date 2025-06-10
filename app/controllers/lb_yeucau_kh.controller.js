const { LB_yeucauKH, LB_hinhanh, LB_xulyCV, Ent_user, Ent_duan, Ent_Phanhe, Ent_phanhe } = require("../models/setup.model");
const { Op, Sequelize, where } = require("sequelize");
const sequelize = require("../config/db.config");
const fs = require("fs");

// 0: 'Chờ xử lý',
// 1: 'Đang xử lý',
// 2: 'Hoàn thành',
// 3: 'Hủy',
// 4: 'Chưa hoàn thành',

const getAll = async (req, res) => {
  try {
    const user = req.user.data;
    let where = {
      isDelete: 0,
    };

    if (user.ID_Chucvu != 1) {
      if (user.arrDuan && typeof user.arrDuan === "string") {
        const idsDuan = user.arrDuan
          .split(",")
          .map((id) => Number(id.trim()))
          .filter(Boolean);
        if (idsDuan.length > 0) {
          where.ID_Duan = {
            [Op.in]: idsDuan,
          };
        }
      } else if (user.ID_Duan) {
        where.ID_Duan = user.ID_Duan;
      } else {
        return res.status(200).json({ message: "Không có dự án được phân quyền", data: [] });
      }
    }

    const data = await LB_yeucauKH.findAll({
      where,
      include: [
        {
          model: Ent_duan,
          as: "ent_duan",
          attributes: ["ID_Duan", "Duan"],
        },
        {
          model: Ent_user,
          as: "ent_user",
          attributes: ["ID_User", "UserName", "HoTen"],
        },
        {
          model: Ent_Phanhe,
          as: "ent_phanhe",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "Thành công!", data });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await LB_yeucauKH.findOne({
      where: {
        ID_YeuCau: id,
        isDelete: 0,
      },
      include: [
        {
          model: Ent_duan,
          as: "ent_duan",
          attributes: ["ID_Duan", "Duan"],
          required: false,
        },
        {
          model: Ent_phanhe,
          as: "ent_phanhe",
          required: false,
        },
        {
          model: Ent_user,
          as: "ent_user",
          attributes: ["ID_User", "UserName", "HoTen"],
          required: false,
        },
        {
          model: LB_hinhanh,
          as: "hinhanh_yeucau",
          required: false,
        },
        {
          model: LB_xulyCV,
          as: "lb_xuly",
          required: false,
          where: {
            isDelete: 0,
          },
          include: [
            {
              model: Ent_user,
              as: "ent_user",
              attributes: ["ID_User", "UserName", "HoTen"],
              required: false,
            },
            {
              model: LB_hinhanh,
              as: "hinhanh_xuly",
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json({ message: "Thành công!", data });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

// type : 0 - yêu cầu
//        1 - xử lý
const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  let savedFilePaths = [];

  try {
    const user = req.user.data;
    const data = req.body;
    const images = req.files || [];

    const isLocalhost = req.get("host").includes("localhost");
    const host = `${isLocalhost ? "http" : "https"}://${req.get("host")}`;

    if (data.type == 0) {
      const dataDetail = {
        ID_Duan: user?.ID_Duan,
        ID_Phanhe: data?.ID_Phanhe || null,
        ID_Useryc: user?.ID_User,
        TenKhachHang: data?.TenKhachHang || user?.Hoten,
        Tenyeucau: data?.Tenyeucau || null,
        NoiDung: data?.NoiDung || null,
        TrangThai: 0,
      };

      const create_yc = await LB_yeucauKH.create(dataDetail, { transaction });
      await Promise.all(
        images.map(async (file) => {
          const relativeLink = file.path.replace(/.*public[\\/]/, "").replace(/\\/g, "/");
          const fullUrl = `${host}/upload/${relativeLink}`;
          savedFilePaths.push(file.path);

          await LB_hinhanh.create(
            {
              ID_YeuCau: create_yc.ID_YeuCau,
              URL: fullUrl,
            },
            { transaction }
          );
        })
      );
    } else {
      const count = await LB_xulyCV.count({
        where: {
          ID_YeuCau: data.ID_YeuCau,
          isDelete: 0,
        },
      });

      const dataDetail = {
        ID_YeuCau: data.ID_YeuCau,
        ID_User: user?.ID_User,
        LanThu: count + 1,
        MoTaCongViec: data?.MoTaCongViec || null,
        TrangThai: data?.TrangThai || 0,
        NoiDung: data?.NoiDung || null,
      };

      await LB_yeucauKH.update(
        { TrangThai: dataDetail.TrangThai },
        {
          where: {
            ID_YeuCau: data.ID_YeuCau,
            isDelete: 0,
          },
          transaction,
        }
      );

      const create_xl = await LB_xulyCV.create(dataDetail, { transaction });

      await Promise.all(
        images.map(async (file) => {
          const relativeLink = file.path.replace(/.*public[\\/]/, "").replace(/\\/g, "/");
          const fullUrl = `${host}/upload/${relativeLink}`;
          savedFilePaths.push(file.path);

          await LB_hinhanh.create(
            {
              ID_XuLy: create_xl.ID_XuLy,
              URL: fullUrl,
            },
            { transaction }
          );
        })
      );
    }

    await transaction.commit();
    res.status(200).json({ message: "Thành công!" });
  } catch (error) {
    await transaction.rollback();

    savedFilePaths.forEach((filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Xóa ảnh thất bại:", filePath);
      });
    });

    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

const softDelete = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (type == 0) {
      await Promise.all([
        LB_xulyCV.update({ isDelete: 1 }, { where: { ID_YeuCau: id }, transaction }),
        LB_yeucauKH.update({ isDelete: 1 }, { where: { ID_YeuCau: id }, transaction }),
      ]);
    } else {
      await LB_xulyCV.update({ isDelete: 1 }, { where: { ID_XuLy: id }, transaction });
    }

    await transaction.commit();
    res.status(200).json({ message: "Xóa thành công!" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  getAll,
  getDetail,
  create,
  softDelete,
};
