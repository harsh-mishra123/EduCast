const Minio = require('minio');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

let minioClient = null;

function initMinio() {
  try {
    minioClient = new Minio.Client({
      endPoint: config.MINIO_ENDPOINT.split(':')[0],
      port: parseInt(config.MINIO_ENDPOINT.split(':')[1]) || 9000,
      useSSL: false,
      accessKey: config.MINIO_ACCESS_KEY,
      secretKey: config.MINIO_SECRET_KEY
    });
    logger.info('MinIO client initialized');
  } catch (error) {
    logger.error('MinIO initialization failed:', error);
  }
  return minioClient;
}

function getMinio() {
  if (!minioClient) {
    initMinio();
  }
  return minioClient;
}

async function ensureBucket(bucketName) {
  try {
    const minio = getMinio();
    if (!minio) {
      logger.warn('MinIO not available, skipping bucket creation');
      return false;
    }
    
    const exists = await minio.bucketExists(bucketName);
    if (!exists) {
      await minio.makeBucket(bucketName);
      logger.info(`Bucket created: ${bucketName}`);
    }
    return true;
  } catch (error) {
    logger.warn(`MinIO bucket check failed: ${error.message}`);
    return false;
  }
}

module.exports = { initMinio, getMinio, ensureBucket };
