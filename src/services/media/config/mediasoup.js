const mediasoup = require('mediasoup');
const config = require('../../../shared/config/env');

let worker = null;
let router = null;

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1
    }
  }
];

async function createWorker() {
  worker = await mediasoup.createWorker({
    logLevel: 'warn',
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    dtlsCertificateFile: null,
    dtlsPrivateKeyFile: null
  });
  
  worker.on('died', () => {
    console.error('Mediasoup worker died, exiting...');
    process.exit(1);
  });
  
  return worker;
}

async function createRouter() {
  if (!worker) {
    await createWorker();
  }
  
  router = await worker.createRouter({ mediaCodecs });
  return router;
}

function getRouter() {
  if (!router) {
    throw new Error('Router not created');
  }
  return router;
}

function getWorker() {
  if (!worker) {
    throw new Error('Worker not created');
  }
  return worker;
}

module.exports = {
  createWorker,
  createRouter,
  getRouter,
  getWorker,
  mediaCodecs
};