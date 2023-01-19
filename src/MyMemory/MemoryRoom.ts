export const memoryRoom = {
  refresh: function() {
    Memory.room = [];
    for(let name in Game.rooms) {
      Memory.room.push(name);
    }
  }
}