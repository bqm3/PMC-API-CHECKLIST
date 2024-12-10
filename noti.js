const { Expo } = require('expo-server-sdk');

// Tạo đối tượng Expo SDK client
let expo = new Expo();

// Dữ liệu push tokens nhóm theo experienceId
const pushTokensByExperience = {
  '@buiminh30/react-native-firebase-test': [
    'ExponentPushToken[YuZBwgIe_ETA8tSsTvnPu2]',
  ],
  '@buiminh30/PMC-CHECKLIST-APP': [
    'ExponentPushToken[8BEGZBHX6cF1lm0wDCtCHc]',
    'ExponentPushToken[EHeChHEbyvpQkBfHeQ8ncc]',
    'ExponentPushToken[48x5lnN_VrPDutFAM_PHXL]'
  ],
};

// Hàm gửi thông báo push cho từng nhóm tokens
(async () => {
  for (let [experienceId, pushTokens] of Object.entries(pushTokensByExperience)) {
    console.log(`Đang gửi thông báo cho nhóm: ${experienceId}`);
    
    let messages = [];

    // Tạo danh sách thông báo
    for (let pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} không hợp lệ.`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        body: `ádfasfasdf`,
        data: { experienceId },
      });
    }

    // Chia nhỏ thông báo thành từng gói
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Gửi từng gói
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(`Kết quả gửi thông báo cho nhóm ${experienceId}:`, ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(`Lỗi khi gửi thông báo cho nhóm ${experienceId}:`, error);
      }
    }

    // Xử lý receipt IDs (biên nhận gửi thông báo)
    let receiptIds = tickets
      .filter(ticket => ticket.status === 'ok')
      .map(ticket => ticket.id);

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    // Lấy thông tin chi tiết từ receipts
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(`Receipt cho nhóm ${experienceId}:`, receipts);

        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(`Có lỗi khi gửi thông báo: ${message}`);
            if (details && details.error) {
              console.error(`Mã lỗi: ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(`Lỗi khi lấy receipts cho nhóm ${experienceId}:`, error);
      }
    }
  }
})();
