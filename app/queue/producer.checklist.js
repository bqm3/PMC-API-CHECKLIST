const amqp = require("amqplib");

const RABBITMQ_URL = process.env.URL_RABBITMQ ;
const QUEUE_NAME = "queue_update_checklist";
const QUEUE_NAME_DONE = "queue_update_checklist_done";

let connection;
let channel;

async function initRabbitMQ() {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true, });
      await channel.assertQueue(QUEUE_NAME_DONE, { durable: true});
      console.log("RabbitMQ connection established.");
    } catch (error) {
      console.error("Error initializing RabbitMQ:", error);
    }
  }
  
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
    }
  }
  
  async function sendToQueueDone(task) {
    try {
      if (!channel) {
        console.error("RabbitMQ channel not initialized. Reinitializing...");
        await initRabbitMQ();
      }
      await channel.sendToQueue(QUEUE_NAME_DONE, Buffer.from(JSON.stringify(task)), {
        persistent: true,
      });
      console.log(`Task sent to queue ${QUEUE_NAME_DONE}:`, task);
    } catch (error) {
      console.error("Error sending task to queue:", error);
    }
  }
  
  
  module.exports = { initRabbitMQ, sendToQueue, sendToQueueDone };