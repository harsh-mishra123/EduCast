class RoomState {
  constructor() {
    this.rooms = new Map();
  }
  
  setRoomState(roomId, state) {
    this.rooms.set(roomId, state);
  }
  
  getRoomState(roomId) {
    return this.rooms.get(roomId);
  }
  
  updateRoomState(roomId, updates) {
    const current = this.getRoomState(roomId) || {};
    this.setRoomState(roomId, { ...current, ...updates });
    return this.getRoomState(roomId);
  }
  
  deleteRoomState(roomId) {
    this.rooms.delete(roomId);
  }
  
  getAllRooms() {
    return Array.from(this.rooms.keys());
  }
}

module.exports = new RoomState();