const { Expo } = require("expo-server-sdk");
const {
  getProjectsChecklistStatus_Noti,
} = require("./app/controllers/tb_checklistc.controller");
const { funcCreateYesterDay } = require("./app/utils/util");
const { Json } = require("sequelize/lib/utils");

// Tạo đối tượng Expo SDK client
let expo = new Expo();

// // Dữ liệu push tokens nhóm theo experienceId
// const pushTokensByExperience = {
//   '@buiminh30/react-native-firebase-test': [
//     'ExponentPushToken[YuZBwgIe_ETA8tSsTvnPu2]',
//   ],
//   '@buiminh30/PMC-CHECKLIST-APP': [
//     'ExponentPushToken[8BEGZBHX6cF1lm0wDCtCHc]',
//     'ExponentPushToken[EHeChHEbyvpQkBfHeQ8ncc]',
//     'ExponentPushToken[48x5lnN_VrPDutFAM_PHXL]'
//   ],
// };

// // Hàm gửi thông báo push cho từng nhóm tokens
// (async () => {
//   for (let [experienceId, pushTokens] of Object.entries(pushTokensByExperience)) {
//     console.log(`Đang gửi thông báo cho nhóm: ${experienceId}`);

//     let messages = [];

//     // Tạo danh sách thông báo
//     for (let pushToken of pushTokens) {
//       if (!Expo.isExpoPushToken(pushToken)) {
//         console.error(`Push token ${pushToken} không hợp lệ.`);
//         continue;
//       }

//       messages.push({
//         to: pushToken,
//         sound: 'default',
//         body: `ádfasfasdf`,
//         data: { experienceId },
//       });
//     }

//     // Chia nhỏ thông báo thành từng gói
//     let chunks = expo.chunkPushNotifications(messages);
//     let tickets = [];

//     // Gửi từng gói
//     for (let chunk of chunks) {
//       try {
//         let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//         console.log(`Kết quả gửi thông báo cho nhóm ${experienceId}:`, ticketChunk);
//         tickets.push(...ticketChunk);
//       } catch (error) {
//         console.error(`Lỗi khi gửi thông báo cho nhóm ${experienceId}:`, error);
//       }
//     }

//     // Xử lý receipt IDs (biên nhận gửi thông báo)
//     let receiptIds = tickets
//       .filter(ticket => ticket.status === 'ok')
//       .map(ticket => ticket.id);

//     let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

//     // Lấy thông tin chi tiết từ receipts
//     for (let chunk of receiptIdChunks) {
//       try {
//         let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//         console.log(`Receipt cho nhóm ${experienceId}:`, receipts);

//         for (let receiptId in receipts) {
//           let { status, message, details } = receipts[receiptId];
//           if (status === 'ok') {
//             continue;
//           } else if (status === 'error') {
//             console.error(`Có lỗi khi gửi thông báo: ${message}`);
//             if (details && details.error) {
//               console.error(`Mã lỗi: ${details.error}`);
//             }
//           }
//         }
//       } catch (error) {
//         console.error(`Lỗi khi lấy receipts cho nhóm ${experienceId}:`, error);
//       }
//     }
//   }
// })();

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
