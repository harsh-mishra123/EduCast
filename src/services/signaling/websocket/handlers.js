const signalingService = require('../services/signaling.service');
const { logger } = require('../../../shared/utils/logger');

async function handleJoinRequest(ws, message) {
  const { lectureId, token } = message;
  
  const validation = await signalingService.validateJoin(lectureId, token);
  
  if (!validation.valid) {
    ws.send(JSON.stringify({
      type: 'join-error',
      error: validation.error
    }));
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'join-approved',
    userId: validation.userId,
    userName: validation.userName,
    lectureId
  }));
}

async function handleOffer(ws, message) {
  const { targetSessionId, offer } = message;
  // Forward offer to target peer
}

async function handleAnswer(ws, message) {
  const { targetSessionId, answer } = message;
  // Forward answer to target peer
}

async function handleIceCandidate(ws, message) {
  const  { targetSessionId, candidate } = message;
  // Forward ICE candidate to target peer
}

module.exports = {
  handleJoinRequest,
  handleOffer,
  handleAnswer,
  handleIceCandidate
};