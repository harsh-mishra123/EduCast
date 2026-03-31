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
  console.log('Mock RabbitMQ connected');
  return { connection: {}, channel: {} };
}

function getChannel() {
  return {};
}

async function publishToQueue(queue, message) {
  console.log(`[MOCK] Published to ${queue}:`, JSON.stringify(message).substring(0, 100));
  return true;
}

async function consumeQueue(queue, callback) {
  console.log(`[MOCK] Consumer registered for ${queue}`);
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue,
  consumeQueue,
  QUEUES
};
