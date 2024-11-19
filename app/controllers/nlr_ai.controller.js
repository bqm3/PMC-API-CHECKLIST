const {
  Tb_checklistchitiet,
  Tb_checklistc,
  Ent_khoicv,
  Ent_checklist,
  Ent_duan,
  Ent_calv,
  Tb_checklistchitietdone,
  Ent_user,
  Ent_nhom,
  Ent_hangmuc,
  Ent_khuvuc,
  Ent_toanha,
  Ent_tang,
  Ent_chinhanh,
  Ent_phanloaida,
  Ent_thietlapca,
} = require("../models/setup.model");
const { Op, Sequelize, fn, col, literal, where } = require("sequelize");
const sequelize = require("../config/db.config");
const expres = require("express");
const moment = require("moment");
const OpenAI = require("openai");
const nrl_ai = require("../models/nlr_ai.model");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PRO_ID,
});

const secondsToTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

exports.danhSachDuLieu = async (req, res) => {
  const t = await sequelize.transaction(); // Khởi tạo transaction
  try {
    const startDate = new Date("2024-10-01"); // Ngày bắt đầu
    const endDate = new Date("2024-10-31 23:59:59"); // Ngày kết thúc (cuối ngày)
    const pageSize = 100; // Số bản ghi xử lý mỗi lần
    let currentPage = 0;
    let hasMoreData = true;
    let allFlattenedResults = []; // Mảng để chứa tất cả dữ liệu đã xử lý

    while (hasMoreData) {
      // Fetch data for Tb_checklistc with plain transformation
      const dataChecklistC = await Tb_checklistc.findAll({
        limit: pageSize,
        offset: currentPage * pageSize,
        attributes: [
          "Ngay",
          "ID_KhoiCV",
          "ID_ThietLapCa",
          "ID_Duan",
          "Tinhtrang",
          "Giobd",
          "Giokt",
          "ID_User",
          "ID_Calv",
          "Tong",
          "TongC",
          "isDelete",
        ],
        include: [
          { model: Ent_duan, attributes: ["Duan"] },
          { model: Ent_thietlapca, attributes: ["Ngaythu"] },
          { model: Ent_khoicv, attributes: ["KhoiCV", "Ngaybatdau", "Chuky"] },
          { model: Ent_calv, attributes: ["Tenca", "Giobatdau", "Gioketthuc"] },
          {
            model: Ent_user,
            attributes: ["UserName", "Email", "Hoten"],
          },
          {
            model: Tb_checklistchitietdone,
            as: "tb_checklistchitietdones",
            attributes: [
              "Description",
              "ID_ChecklistC",
              "Gioht",
              "Vido",
              "Kinhdo",
              "isDelete",
            ],
          },
          {
            model: Tb_checklistchitiet,
            as: "tb_checklistchitiets",
            attributes: [
              "ID_Checklistchitiet",
              "ID_ChecklistC",
              "ID_Checklist",
              "Ketqua",
              "Anh",
              "Ngay",
              "Gioht",
              "Ghichu",
              "isDelete",
            ],
          },
        ],
        where: {
          isDelete: 0,
          Ngay: {
            [Op.between]: [startDate, endDate],
          },
        },
        transaction: t, // Đảm bảo truy vấn này sử dụng transaction
      });

      if (!dataChecklistC.length) {
        hasMoreData = false; // Dừng nếu không còn dữ liệu
        break;
      }

      const resultWithDetails = dataChecklistC.map((result) => {
        const timeToSeconds = (time) => {
          const [hours, minutes, seconds] = time.split(":").map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        };

        const allGioht = [
          ...result.tb_checklistchitietdones.map((entry) => entry.Gioht),
          ...result.tb_checklistchitiets.map((entry) => entry.Gioht),
        ].filter((gioht) => gioht);

        const allGiohtInSeconds = allGioht.map(timeToSeconds);

        const minGioht = allGiohtInSeconds.length
          ? Math.min(...allGiohtInSeconds)
          : null;
        const maxGioht = allGiohtInSeconds.length
          ? Math.max(...allGiohtInSeconds)
          : null;

        const totalDiff =
          allGiohtInSeconds.length > 1
            ? allGiohtInSeconds
                .sort((a, b) => a - b)
                .reduce((acc, curr, index, arr) => {
                  if (index === 0) return acc;
                  return acc + (curr - arr[index - 1]);
                }, 0)
            : 0;

        const avgTimeDiff =
          totalDiff && allGiohtInSeconds.length > 1
            ? totalDiff / (allGiohtInSeconds.length - 1)
            : null;

        const countWithGhichu = result.tb_checklistchitiets.filter(
          (entry) => entry.Ghichu
        ).length;
        const countWithAnh = result.tb_checklistchitiets.filter(
          (entry) => entry.Anh
        ).length;

        return {
          Tenduan: result.ent_duan.Duan,
          Giamsat: result.ent_user.Hoten,
          Tenkhoi: result.ent_khoicv.KhoiCV,
          Tenca: result.ent_calv.Tenca,
          Ngay: result.Ngay,
          Tilehoanthanh: (result.TongC / result.Tong) * 100 || 0, // Tỷ lệ hoàn thành
          TongC: result.TongC,
          Tong: result.Tong,
          Thoigianmoca: result.Giobd,
          Thoigianchecklistbatdau: minGioht
            ? new Date(minGioht * 1000).toISOString().substr(11, 8)
            : null,
          Thoigianchecklistkethuc: maxGioht
            ? new Date(maxGioht * 1000).toISOString().substr(11, 8)
            : null,
          Thoigiantrungbinh: avgTimeDiff || 0,
          Thoigianchecklistngannhat: minGioht || 0,
          Thoigianchecklistlaunhau: maxGioht || 0,
          Soluongghichu: countWithGhichu,
          Soluonghinhanh: countWithAnh,
          isDelete: 0,
        };
      });

      // Thêm kết quả vào mảng chứa tất cả kết quả
      allFlattenedResults = allFlattenedResults.concat(resultWithDetails);

      currentPage++;
    }

    // Sau khi hoàn tất việc nhập dữ liệu, thực hiện bulkCreate
    try {
      // Chèn tất cả dữ liệu vào bảng nrl_ai trong transaction
      await nrl_ai.bulkCreate(allFlattenedResults, {
        ignoreDuplicates: true, // Nếu có dữ liệu trùng lặp, bỏ qua
        transaction: t, // Đảm bảo chèn vào cùng transaction
      });

      // Commit transaction sau khi thành công
      await t.commit();

      // Gửi phản hồi thành công sau khi chèn xong tất cả dữ liệu
      res.status(200).json({
        message: "Danh sách checklist đã được chèn vào bảng nrl_ai",
      });
    } catch (error) {
      // Nếu có lỗi trong quá trình chèn dữ liệu, rollback transaction
      await t.rollback();
      
      // Xử lý lỗi khi chèn dữ liệu vào bảng nrl_ai
      res.status(500).json({
        message: "Lỗi khi chèn dữ liệu vào bảng nrl_ai",
        error: error.message,
      });
    }

  } catch (err) {
    // Nếu có lỗi trong quá trình fetch dữ liệu hoặc xử lý chung, rollback transaction
    await t.rollback();

    // Xử lý lỗi chung
    res.status(500).json({
      message: err.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};


exports.chatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Hoặc "gpt-4" nếu bạn có quyền truy cập
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: message,
            },
          ],
        },
      ],
    });
    const reply = stream.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi! Vui lòng thử lại sau.",
    });
  }
};
