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
}

function goGetEnergy(creep: Creep, room: RoomMemory): void {
  let targetContainer: AnyStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter :
    (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0});
  if (targetContainer == undefined) {
    let target: Source = Game.getObjectById(room.sources[0]);
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  } else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}