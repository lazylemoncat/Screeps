export const roleUpgrader = {
  run: function(creep: Creep, room: RoomMemory): void {
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
      goUpgrade(creep);
    } else {
      goGetEnergy(creep, room);
    }
	}
};

function goUpgrade(creep: Creep): void {
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
  return;
}

function goGetEnergy(creep: Creep, room: RoomMemory): void {
  let creepNeed = creep.store.getFreeCapacity(RESOURCE_ENERGY);
  let controller = creep.room.controller;
  let containers = room.containers.map(i => Game.getObjectById(i));
  let container = controller.pos.findInRange(containers, 2)[0];
  if (container != undefined && container.store[RESOURCE_ENERGY] >= creepNeed) {
    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(container);
    }
    return;
  } else {
    let target = creep.room.find(FIND_STRUCTURES).filter(i => (i.structureType == STRUCTURE_CONTAINER ||
      i.structureType == STRUCTURE_STORAGE) && 
      i.store[RESOURCE_ENERGY] >= creepNeed);
    if (target[0] != undefined) {
      if (creep.withdraw(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target[0]);
      }
    } else {
      let source = Game.getObjectById(room.sources[0]);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
  return;
}