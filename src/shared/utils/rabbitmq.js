const amqp = require('amqplib');
const config = require('../config/env');
const { logger } = require('./logger');

let connection = null;
let channel = null;

const QUEUES = {
  // Video queues
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_TRANSCODED: 'video.transcoded',
  VIDEO_THUMBNAIL: 'video.thumbnail',
  
  // Live lecture queues
  LIVE_STARTED: 'live.started',
  LIVE_ENDED: 'live.ended',
  LIVE_ENROLLED: 'live.enrolled',
  LIVE_RECORDING_READY: 'live.recording.ready',
  
  // Payment queues
  PAYMENT_COMPLETED: 'payment.completed',
  PAYOUT_READY: 'payout.ready',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Notification queues
  EMAIL_WELCOME: 'email.welcome',
  EMAIL_REMINDER: 'email.reminder',
  EMAIL_CERTIFICATE: 'email.certificate',
  CERTIFICATE_GENERATED: 'certificate.generated',
  
  // Dead letter queue
  DLQ: 'dead.letter.queue'
};

const EXCHANGES = {
  VIDEO_EVENTS: 'video.events',
  LIVE_EVENTS: 'live.events',
  PAYMENT_EVENTS: 'payment.events',
  NOTIFICATION_EVENTS: 'notification.events'
};

async function connectRabbitMQ() {
  try {
    const url = config.RABBITMQ_URL || 'amqp://localhost:5672';
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    
    // Assert queues with dead letter configuration
    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': QUEUES.DLQ,
          'x-max-retries': 3
        }
      });
    }
    
    // Assert dead letter queue
    await channel.assertQueue(QUEUES.DLQ, { durable: true });
    
    // Assert exchanges
    for (const exchange of Object.values(EXCHANGES)) {
      await channel.assertExchange(exchange, 'topic', { durable: true });
    }
    
    // Set prefetch to 1 for fair distribution
    await channel.prefetch(1);
    
    logger.info('RabbitMQ connected');
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

async function publishToExchange(exchange, routingKey, message) {
  try {
    const ch = getChannel();
    return ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
  } catch (error) {
    logger.error(`Failed to publish to exchange ${exchange}:`, error);
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
          
          // Check retry count
          const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
          if (retryCount < 3) {
            // Reject and requeue with retry count
            ch.nack(msg, false, true);
          } else {
            // Send to DLQ
            ch.nack(msg, false, false);
          }
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

async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue,
  publishToExchange,
  consumeQueue,
  ackMessage,
  nackMessage,
  closeConnection,
  QUEUES,
  EXCHANGES
};
