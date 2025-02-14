const amqp = require("amqplib");

const RABBITMQ_URL = process.env.URL_RABBITMQ;
const QUEUE_NAME = "queue_update_checklist";
const QUEUE_NAME_DONE = "queue_update_checklist_done";

let connection;
let channel;

// Hàm khởi tạo kết nối RabbitMQ
async function initRabbitMQ() {
  try {
    console.log("Connecting to RabbitMQ...");
    connection = await amqp.connect(RABBITMQ_URL);

    // Xử lý khi kết nối bị đóng
    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      setTimeout(initRabbitMQ, 5000); // Thử kết nối lại sau 5 giây
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.assertQueue(QUEUE_NAME_DONE, { durable: true });
    console.log("RabbitMQ connection established.");
  } catch (error) {
    console.error("Error initializing RabbitMQ:", error);
    setTimeout(initRabbitMQ, 5000); // Thử lại sau 5 giây nếu lỗi
  }
}

// Hàm gửi task tới queue
async function sendToQueue(task) {
  try {
    if (!channel) {
      console.error("RabbitMQ channel not initialized. Reinitializing...");
      await initRabbitMQ();
    }
    await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(task)), {
      persistent: true,
    });
    console.log(`Task sent to queue ${QUEUE_NAME}:`, task);
  } catch (error) {
    console.error("Error sending task to queue:", error);
    if (error.message.includes("Channel closed")) {
      console.error("Reinitializing RabbitMQ connection...");
      await initRabbitMQ(); // Khôi phục kết nối nếu channel bị đóng
    }
  }
}

// Hàm gửi task tới queue_done
async function sendToQueueDone(task) {
  try {
    if (!channel) {
      console.error("RabbitMQ channel not initialized. Reinitializing...");
      await initRabbitMQ();
    }
    await channel.sendToQueue(
      QUEUE_NAME_DONE,
      Buffer.from(JSON.stringify(task)),
      {
        persistent: true,
      }
    );
    console.log(`Task sent to queue ${QUEUE_NAME_DONE}:`, task);
  } catch (error) {
    console.error("Error sending task to queue:", error);
    if (error.message.includes("Channel closed")) {
      console.error("Reinitializing RabbitMQ connection...");
      await initRabbitMQ(); // Khôi phục kết nối nếu channel bị đóng
    }
  }
}

module.exports = { initRabbitMQ, sendToQueue, sendToQueueDone };
