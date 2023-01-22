export const roleMiner = {
  run: function(creep: Creep, room: RoomMemory): void {
    if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK)) {
      transferEnergy(creep, room);
      return;
    }
    goHarvest(creep, room);
    return;
  },
}

function goHarvest(creep: Creep, room: RoomMemory): void {
  let mineral = Game.getObjectById(room.mineral);
  if (!creep.pos.isNearTo(mineral)) {
    creep.myMove(mineral);
    return;
  }
  creep.harvest(mineral);
  return;
}

function transferEnergy(creep: Creep, room: RoomMemory): void {
  let storage = Game.getObjectById(room.storage);
  if (!creep.pos.isNearTo(storage)) {
    creep.myMove(storage);
    return;
  }
  let type = Object.keys(creep.store)[0] as ResourceConstant;
  creep.transfer(storage, type);
  return;
}