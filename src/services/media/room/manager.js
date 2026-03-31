const { getRouterInstance } = require('../mediasoup/router');
const webRTCManager = require('../mediasoup/webrtc');
const { logger } = require('../../../shared/utils/logger');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Map of peers
  }
  
  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
      logger.info(`Room created: ${roomId}`);
    }
    return this.rooms.get(roomId);
  }
  
  async addPeer(roomId, peerId, socketId) {
    const room = this.getOrCreateRoom(roomId);
    
    const transport = await webRTCManager.createTransport(roomId, peerId);
    
    const peer = {
      peerId,
      socketId,
      transportId: transport.id,
      producers: new Map(),
      consumers: new Map()
    };
    
    room.set(peerId, peer);
    logger.info(`Peer ${peerId} joined room ${roomId}`);
    
    return { transport, peer };
  }
  
  async removePeer(roomId, peerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const peer = room.get(peerId);
    if (peer) {
      // Close all producers
      for (const producer of peer.producers.values()) {
        await webRTCManager.closeTransport(producer.transportId);
      }
      
      // Close transport
      await webRTCManager.closeTransport(peer.transportId);
      
      room.delete(peerId);
      logger.info(`Peer ${peerId} left room ${roomId}`);
    }
    
    // Delete room if empty
    if (room.size === 0) {
      this.rooms.delete(roomId);
      logger.info(`Room deleted: ${roomId}`);
    }
  }
  
  getPeer(roomId, peerId) {
    const room = this.rooms.get(roomId);
    return room?.get(peerId);
  }
  
  getRoomPeers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    const peers = [];
    for (const [peerId, peer] of room) {
      peers.push({
        peerId,
        socketId: peer.socketId,
        producers: Array.from(peer.producers.keys())
      });
    }
    return peers;
  }
  
  async addProducer(roomId, peerId, producerId, kind, transportId) {
    const peer = this.getPeer(roomId, peerId);
    if (peer) {
      peer.producers.set(producerId, { kind, transportId });
      logger.info(`Producer added: ${producerId} (${kind}) for peer ${peerId}`);
    }
  }
  
  async removeProducer(roomId, peerId, producerId) {
    const peer = this.getPeer(roomId, peerId);
    if (peer) {
      peer.producers.delete(producerId);
      logger.info(`Producer removed: ${producerId}`);
    }
  }
  
  async addConsumer(roomId, peerId, consumerId, producerId, transportId) {
    const peer = this.getPeer(roomId, peerId);
    if (peer) {
      peer.consumers.set(consumerId, { producerId, transportId });
      logger.info(`Consumer added: ${consumerId} for peer ${peerId}`);
    }
  }
  
  async removeConsumer(roomId, peerId, consumerId) {
    const peer = this.getPeer(roomId, peerId);
    if (peer) {
      peer.consumers.delete(consumerId);
      logger.info(`Consumer removed: ${consumerId}`);
    }
  }
  
  getProducers(roomId, excludePeerId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    const producers = [];
    for (const [peerId, peer] of room) {
      if (excludePeerId && peerId === excludePeerId) continue;
      
      for (const [producerId, info] of peer.producers) {
        producers.push({
          producerId,
          peerId,
          kind: info.kind,
          transportId: info.transportId
        });
      }
    }
    return producers;
  }
}

module.exports = new RoomManager();