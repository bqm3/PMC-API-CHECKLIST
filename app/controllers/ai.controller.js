import {
  Tb_checklistchitiet,
  Tb_checklistc,
  Ent_khoicv,
  Ent_checklist,
} from "../models/setup.model";

exports.checklistYearByKhoiCVSuCo = async (req, res) => {
  try {
    const userData = req.user.data;
    const year = req.query.year || new Date().getFullYear(); // Lấy năm
    const khoi = req.query.khoi || 'all';
    const tangGiam = "desc"; // Thứ tự sắp xếp

    // Xây dựng điều kiện where cho truy vấn
    let whereClause = {
      isDelete: 0,
      ID_Duan: userData.ID_Duan, // Lấy theo ID dự án của userData
    };

    if (khoi !== "all" ) {
      whereClause.ID_KhoiCV = khoi;
    }

    if (year) {
      whereClause.Ngay = {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`,
      };
    }

    const relatedChecklists = await Tb_checklistchitiet.findAll({
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

      include: [
        {
          model: Tb_checklistc,
          as: "tb_checklistc",
          attributes: [
            "ID_KhoiCV",
            "Ngay",
            "TongC",
            "Tong",
            "Tinhtrang",
            "ID_Duan",
            "isDelete",
          ],
          include: [
            {
              model: Ent_khoicv,
              attributes: ["KhoiCV"], // Tên khối
            },
          ],
          where: whereClause,
        },
        {
          model: Ent_checklist,
          attributes: [
            "ID_Checklist",
            "ID_Hangmuc",
            "ID_Tang",
            "Sothutu",
            "Maso",
            "MaQrCode",
            "Checklist",
            "Giatridinhdanh",
            "isCheck",
            "Giatrinhan",
            "Tinhtrang",
          ],
          where: {
            Tinhtrang: 1,
          },
        },
      ],
    });

    // Tạo đối tượng để lưu số lượng sự cố theo khối công việc và tháng
    const khoiIncidentCount = {};

    // Xử lý dữ liệu để đếm số lượng sự cố cho từng khối theo tháng
    relatedChecklists.forEach((checklistC) => {
      const khoiName = checklistC.tb_checklistc.ent_khoicv.KhoiCV; // Lấy tên khối
      const checklistDate = new Date(checklistC.tb_checklistc.Ngay);
      const checklistMonth = checklistDate.getMonth(); // Lấy tháng (0 = January)

      if (!khoiIncidentCount[khoiName]) {
        khoiIncidentCount[khoiName] = Array(12).fill(0);
      }

      // Tăng số lượng sự cố cho khối này theo tháng
      khoiIncidentCount[khoiName][checklistMonth] += 1;
    });

    // Chuyển đối tượng thành mảng kết quả
    const formatSeriesData = (data) => {
      const khois = Object.keys(data);
      return khois.map((khoi) => ({
        name: khoi,
        data: data[khoi],
      }));
    };

    const formattedSeries = formatSeriesData(khoiIncidentCount);

    // Sắp xếp kết quả theo tangGiam
    const sortedSeries = formattedSeries.sort((a, b) => {
      const sumA = a.data.reduce((sum, value) => sum + value, 0);
      const sumB = b.data.reduce((sum, value) => sum + value, 0);
      return tangGiam === "asc" ? sumA - sumB : sumB - sumA;
    });

    const result = {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      series: [
        {
          type: String(year), // Gán type với giá trị năm
          data: sortedSeries,
        },
      ],
    };

    // Trả về kết quả
    res.status(200).json({
      message: "Số lượng sự cố theo khối công việc và tháng",
      data: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi! Vui lòng thử lại sau." });
  }
};
