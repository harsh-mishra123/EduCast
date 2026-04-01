const amqp = require('amqplib');
const config = require('../config/env');
const { logger } = require('./logger');

let connection = null;
let channel = null;

const QUEUES = {
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_TRANSCODED: 'video.transcoded',
  LIVE_STARTED: 'live.started',
  LIVE_ENDED: 'live.ended',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYOUT_READY: 'payout.ready',
  EMAIL_WELCOME: 'email.welcome',
  EMAIL_REMINDER: 'email.reminder',
  CERTIFICATE_READY: 'certificate.ready',
  DLQ: 'dead.letter.queue'
};

async function connectRabbitMQ() {
  try {
    const url = config.RABBITMQ_URL || 'amqp://localhost:5672';
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    
    // Create queues with consistent configuration
    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, {
        durable: true,
        arguments: queue === QUEUES.DLQ ? {} : {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': QUEUES.DLQ
        }
      });
      logger.info(`Queue ensured: ${queue}`);
    }
    
    logger.info('RabbitMQ connected and queues ready');
    return { connection, channel };
  } catch (error) {
    logger.error('RabbitMQ connection error:', error);
    throw error;
  }
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ not connected');
  return channel;
}

async function publishToQueue(queue, message, options = {}) {
  try {
    const ch = getChannel();
    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      ...options
    });
  } catch (error) {
    logger.error(`Failed to publish to queue ${queue}:`, error);
    throw error;
  }
}

async function consumeQueue(queue, callback, autoAck = false) {
  try {
    const ch = getChannel();
    await ch.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg);
          if (autoAck) {
            ch.ack(msg);
          }
        } catch (error) {
          logger.error(`Error processing message from ${queue}:`, error);
          ch.nack(msg, false, false);
        }
      }
    }, { noAck: autoAck });
    
    logger.info(`Consumer registered for queue: ${queue}`);
  } catch (error) {
    logger.error(`Failed to consume queue ${queue}:`, error);
    throw error;
  }
}

async function ackMessage(msg) {
  const ch = getChannel();
  ch.ack(msg);
}

async function nackMessage(msg, requeue = false) {
  const ch = getChannel();
  ch.nack(msg, false, requeue);
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue,
  consumeQueue,
  ackMessage,
  nackMessage,
  QUEUES
};
