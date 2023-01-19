export const structureLink = {
  run: function(link: StructureLink, room: RoomMemory): void {
    for (let i = 0; i < room.fromLinks.length; ++i) {
      if (room.fromLinks[i] == link.id) {
        transfer(link, room);
        break;
      }
    }
  },
}

function transfer(link: StructureLink, room: RoomMemory): void {
  if (link.store[RESOURCE_ENERGY] >= 100) {
    for (let i = 0; i < room.toLinks.length; ++i) {
      let energy = Game.getObjectById(room.toLinks[i]).store.getFreeCapacity(RESOURCE_ENERGY);
      if (energy > 10) {
        link.transferEnergy(Game.getObjectById(room.toLinks[i]));
        return;
      }
    }
  }
}