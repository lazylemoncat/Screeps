export const roleBuilder = {
  run: function (creep: Creep, room: RoomMemory): void {
    if (backRoom(creep) == 0) {
      return;
    }
    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    } else if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if(creep.memory.building) {
      goBuild(creep, room);
    } else {
      goGetEnergy(creep, room);
    }
	}
};

function backRoom(creep: Creep): number {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}

function goBuild(creep: Creep, room: RoomMemory): void {
  let target: ConstructionSite[] = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(target[0]) {
      if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) / 2 &&
        !creep.pos.inRangeTo(target[0], 10)){
        creep.memory.building = false;
        return;
      }
      if(creep.build(target[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
}

function goGetEnergy(creep: Creep, room: RoomMemory): void {
  let targetStore: AnyStoreStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0}});

  if (targetStore != null) {
    if (creep.withdraw(targetStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetStore);
    }
    return;
  }
  let sources: Source = Game.getObjectById(room.sources[0]);
  if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
    if (creep.moveTo(sources[0]) == ERR_NO_PATH) {
      if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[1]);
      }
    }
  }
  return;
}