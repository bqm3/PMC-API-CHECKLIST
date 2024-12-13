const { Expo } = require("expo-server-sdk");
const {
  getProjectsChecklistStatus_Noti,
} = require("./app/controllers/tb_checklistc.controller");
const { funcCreateYesterDay } = require("./app/utils/util");
const { Json } = require("sequelize/lib/utils");

// Tạo đối tượng Expo SDK client
let expo = new Expo();

exports.funcAutoNoti = async () => {
  try {
    const yesterday = funcCreateYesterDay();
    const projects = await getProjectsChecklistStatus_Noti();
    const notificationResults = [];

    // Sử dụng Promise.all để gửi thông báo song song
    await Promise.all(
      projects.map(async (project) => {
        // Duyệt qua từng người dùng của dự án
        await Promise.all(
          project.users.map(async (user) => {
            // Trả về nếu không có device token
            if (!user.deviceToken) return;

            let bodyMessage;
            let title;

            if (user.khoiCV != null) {
              bodyMessage = `${user.TenKhoi} : ${user.completionRatio || 0}%`;
              title = `Tỉ lệ checklist ngày: ${yesterday}`;
            } else {
              // const khoisInfo = project.createdKhois.map(khoi => {
              //   return `${khoi.TenKhoi}: ${khoi.completionRatio || 0}%`;
              // }).join('\n');
              const khoisInfo = project.createdKhois
                .reduce((result, khoi, index, array) => {
                  if (index % 2 === 0) {
                    const nextKhoi = array[index + 1];
                    const firstKhoi = `${khoi.TenKhoi}: ${
                      khoi.completionRatio || 0
                    }%`;
                    const secondKhoi = nextKhoi
                      ? ` | ${nextKhoi.TenKhoi}: ${
                          nextKhoi.completionRatio || 0
                        }%`
                      : "";
                    result.push(firstKhoi + secondKhoi);
                  }
                  return result;
                }, [])
                .join("\n");
              title = `Tỉ lệ checklist thấp ngày: ${yesterday}`;
              bodyMessage = khoisInfo;
            }

            //`Các khối có tỉ lệ checklist thấp ngày: ${yesterday}\n`

            // Cấu hình thông báo
            const message = {
              to: user.deviceToken,
              sound: "default",
              title: title,
              body: bodyMessage,
            };

            try {
              // Gửi thông báo với timeout
              const ticket = await Promise.race([
                expo.sendPushNotificationsAsync([message]),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Notification timeout")),
                    5000
                  )
                ),
              ]);

              // Ghi log kết quả gửi thông báo thành công
              console.log(`Notification sent to ${user.name}`, ticket);
              notificationResults.push({
                userId: user.id,
                userName: user.name,
                status: "success",
              });
            } catch (error) {
              // Ghi log chi tiết lỗi
              console.error(`Notification error for user ${user.name}:`, error);
              notificationResults.push({
                userId: user.id,
                userName: user.name,
                status: "error",
                errorMessage: error.message,
              });
            }
          })
        );
      })
    );

    // Trả về kết quả dự án và thông báo
    return { projects, notificationResults };
  } catch (error) {
    // Xử lý lỗi toàn cục
    console.error("Failed in funcAutoNoti:", error);
    throw error;
  }
};
