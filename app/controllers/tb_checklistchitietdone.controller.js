const {
  Tb_checklistchitietdone,
  Tb_checklistc,
  Ent_checklist,
  beboi,
} = require("../models/setup.model");
const sequelize = require("../config/db.config");
const { sendToQueueDone, sendToQueue } = require("../queue/producer.checklist");

const insertIntoDynamicTable = async (tableName, data, transaction) => {
  await sequelize.query(
    `
    INSERT INTO ${tableName} 
      (ID_ChecklistC, Description, Gioht, Vido, Kinhdo, Docao, isScan, isCheckListLai, isDelete)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    {
      replacements: [
        data.ID_ChecklistC,
        data.Description,
        data.Gioht,
        data.Vido,
        data.Kinhdo,
        data.Docao,
        data.isScan,
        data.isCheckListLai,
        0,
      ],
      transaction,
    }
  );
};

const insertIntoDynamicTableChiTiet = async (
  tableName,
  records,
  transaction
) => {
  const query = `
    INSERT INTO ${tableName}
      (ID_ChecklistC, ID_Checklist, Vido, Kinhdo, Docao, Ketqua, Gioht, Ghichu, isScan, Anh, Ngay, isCheckListLai)
    VALUES ?`;

  const values = records.map((record) => [
    record.ID_ChecklistC,
    record.ID_Checklist,
    record.Vido || null,
    record.Kinhdo || null,
    record.Docao || null,
    record.Ketqua || null,
    record.Gioht || null,
    record.Ghichu || null,
    record.isScan || null,
    record.Anh || null,
    record.Ngay || null,
    record.isCheckListLai || 0,
  ]);

  await sequelize.query(query, {
    replacements: [values],
    type: sequelize.QueryTypes.INSERT,
    transaction,
  });
};

exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userData = req.user.data;
    if (!userData) {
      return res.status(401).json({ message: "Bạn không có quyền tạo dự án!" });
    }

    const {
      ID_Checklists,
      Description,
      checklistLength,
      ID_ChecklistC,
      Vido,
      Kinhdo,
      Docao,
      Gioht,
      isScan,
      isCheckListLai,
    } = req.body;

    if (!Description || !Gioht) {
      return res.status(400).json({ message: "Không thể checklist dữ liệu!" });
    }

    const now = new Date();
    const dynamicTableName = `tb_checklistchitietdone_${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}_${now.getFullYear()}`;
    const dynamicTableNameChitiet = `tb_checklistchitiet_${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}_${now.getFullYear()}`;

    // Truy vấn toàn bộ checklist theo ID_Checklists
    const entChecklists = await Ent_checklist.findAll({
      attributes: ["ID_Checklist", "Giatridinhdanh", "ID_Phanhe"],
      where: { ID_Checklist: ID_Checklists },
      transaction,
    });

    // Lọc checklist thuộc phân hệ 3
    const checklistPhanhe3 = entChecklists.filter(
      (item) => item.ID_Phanhe === 3
    );
    const checklistPhanhe3Ids = checklistPhanhe3.map(
      (item) => item.ID_Checklist
    );

    // Lấy phần còn lại không thuộc phân hệ 3
    const remainingChecklists = ID_Checklists.filter(
      (id) => !checklistPhanhe3Ids.includes(id)
    );
    const remainingDescription = remainingChecklists.join(",");

    // Nếu có checklist phân hệ 3 → insert vào bảng chitiet
    if (checklistPhanhe3.length > 0) {
      const dataChiTiet = checklistPhanhe3.map((item) => ({
        ID_ChecklistC,
        ID_Checklist: item.ID_Checklist,
        Ketqua: item.Giatridinhdanh || null,
        Anh: null,
        Vido,
        Kinhdo,
        Docao,
        Gioht,
        isScan,
        isCheckListLai: !isCheckListLai ? 0 : 1,
      }));

      await insertIntoDynamicTableChiTiet(
        dynamicTableNameChitiet,
        dataChiTiet,
        transaction
      );
      const backgroundTask = {
        records: dataChiTiet,
        dynamicTableName: dynamicTableNameChitiet,
      };
      await sendToQueue(backgroundTask);
      await insertBeBoiSimple(req.user.data, dataChiTiet);
    }

    // Nếu còn checklist không phải phân hệ 3 → insert vào bảng done
    if (remainingChecklists.length > 0) {
      const data = {
        ID_ChecklistC: ID_ChecklistC || null,
        Description: remainingDescription || "",
        Gioht,
        Vido: Vido || null,
        Kinhdo: Kinhdo || null,
        Docao: Docao || null,
        isScan: isScan || null,
        isCheckListLai: isCheckListLai === 1 ? 1 : 0,
        isDelete: 0,
      };

      await insertIntoDynamicTable(dynamicTableName, data, transaction);

      // Gửi task lên queue sau khi insert thành công
      const backgroundTask = {
        records: {
          ...data,
          checklistLength: remainingChecklists.length,
          ID_Checklists: remainingChecklists,
        },
        dynamicTableName,
      };

      setImmediate(() => {
        sendToQueueDone(backgroundTask).catch(console.error);
      });
    }

    // ✅ Commit cuối cùng
    await transaction.commit();

    return res.status(200).json({ message: "Checklist thành công!" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error details:", error);
    return res.status(500).json({
      error: error.message || "Đã xảy ra lỗi trong quá trình checklist",
    });
  }
};

const insertBeBoiSimple = async (userData, checklistPhanhe3) => {
  const dataToInsert = checklistPhanhe3.map((item) => ({
    Nguoi_tao: userData?.UserName || userData.Email || "unknown",
    ID_Duan: userData?.ID_Duan,
    ID_Checklist: item.ID_Checklist,
    ID_ChecklistC: item.ID_ChecklistC,
    Giatrighinhan: item.Ketqua,
    ID_Loaisosanh: 0,
    Giatridinhdanh: null,
    Giatrisosanh: null,
    Giatriloi: null,
    Ngay_ghi_nhan: new Date().toISOString(),
  }));

  if (dataToInsert.length > 0) {
    await beboi.bulkCreate(dataToInsert);
  }
};

exports.getDataFormat = async (req, res) => {
  try {
    const checklistDoneItems = await Tb_checklistchitietdone.findAll({
      attributes: ["Description", "Gioht", "ID_ChecklistC"],
      where: { isDelete: 0 },
    });

    const arrPush = [];

    checklistDoneItems.forEach((item) => {
      const idChecklists = item.Description.split(",").map(Number);
      if (idChecklists.length > 0) {
        idChecklists.map((it) => {
          if (Number(item.ID_ChecklistC) === Number(req.params.idc)) {
            arrPush.push({
              ID_ChecklistC: parseInt(item.ID_ChecklistC),
              ID_Checklist: it,
              Gioht: item.Gioht,
            });
          }
        });
      }
    });

    // Trả về dữ liệu hoặc thực hiện các thao tác khác ở đây
    res.status(200).json(arrPush);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
