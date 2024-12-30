const amqp = require("amqplib");
const sequelize = require("../config/db.config");
const { Tb_checklistc, Ent_checklist } = require("../models/setup.model");
const { Sequelize } = require("sequelize");
const { removeVietnameseTones } = require("../utils/util");

const RABBITMQ_URL = process.env.URL_RABBITMQ;
const QUEUE_NAME = "queue_update_checklist";

async function processBackgroundTask() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("Waiting for tasks in queue...");

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const task = JSON.parse(msg.content.toString());

          const transaction = await sequelize.transaction();
          try {
            // Tìm kiếm và cập nhật
            const checklistC = await Tb_checklistc.findOne({
              attributes: ["ID_ChecklistC", "Tong", "TongC", "isDelete"],
              where: {
                ID_ChecklistC: task.records[0].ID_ChecklistC,
                isDelete: 0,
              },
              transaction,
            });

            await updateTongC(checklistC, task.records, transaction);

            // Xử lý từng checklist chi tiết
            await Promise.all(
              task.records.map((record) =>
                processChecklist(record, transaction)
              )
            );

            await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            console.error("Error processing background task:", error);
          }

          // Xác nhận task đã được xử lý
          channel.ack(msg);
        }
      },
      { noAck: false } // Đảm bảo task chỉ được xóa khỏi queue sau khi xử lý thành công
    );
  } catch (error) {
    console.error("Error in background task processor:", error);
  }
}

module.exports = { processBackgroundTask };

const updateTongC = async (checklistC, newRecords, transaction) => {
  if (checklistC) {
    const currentTongC = checklistC.TongC;
    const totalTong = checklistC.Tong;

    if (currentTongC < totalTong) {
      const hasIsCheckListLaiZero = newRecords.filter(
        (item) => item.isCheckListLai === 0
      );
      await Tb_checklistc.update(
        {
          TongC: Sequelize.literal(`TongC + ${hasIsCheckListLaiZero.length}`),
        },
        {
          where: { ID_ChecklistC: checklistC.ID_ChecklistC },
          transaction,
        }
      );
    }
  }
};

const checklistCache = new Map();

const getChecklist = async (id, transaction) => {
  if (checklistCache.has(id)) {
    return checklistCache.get(id); // Lấy từ bộ nhớ đệm nếu đã có
  }

  // Truy vấn cơ sở dữ liệu nếu chưa có trong bộ nhớ đệm
  const checklistRecord = await Ent_checklist.findOne({
    where: { ID_Checklist: id, isDelete: 0 },
    attributes: [
      "Checklist",
      "ID_Checklist",
      "Giatriloi",
      "Giatridinhdanh",
      "isDelete",
    ],
    transaction,
  });

  // Lưu vào bộ nhớ đệm
  if (checklistRecord) {
    checklistCache.set(id, checklistRecord);
  }

  return checklistRecord;
};

const processChecklist = async (record, transaction) => {
  // Sử dụng getChecklist để lấy dữ liệu
  const checklistRecord = await getChecklist(record.ID_Checklist, transaction);

  if (checklistRecord) {
    // Kiểm tra điều kiện cập nhật Tinhtrang
    const shouldUpdateTinhtrang =
      removeVietnameseTones(record?.Ketqua) ===
        removeVietnameseTones(checklistRecord?.Giatriloi) ||
      ((record?.Anh || record?.GhiChu) &&
        removeVietnameseTones(record?.Ketqua) !==
          removeVietnameseTones(checklistRecord?.Giatridinhdanh));

    // Cập nhật Tinhtrang
    const updateData = { Tinhtrang: shouldUpdateTinhtrang ? 1 : 0 };
    await Ent_checklist.update(updateData, {
      where: {
        ID_Checklist: record.ID_Checklist,
        isDelete: 0,
      },
      transaction,
    });
  }
};
