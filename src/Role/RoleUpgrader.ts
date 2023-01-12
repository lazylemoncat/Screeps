export const roleUpgrader = {
  run: function(creep: Creep): void {
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
      isNearToTarget(creep);
      goUpgrade(creep);
    } else {
      goGetEnergy(creep);
    }
	}
};

function goUpgrade(creep: Creep): void {
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

function goGetEnergy(creep: Creep): void {
  let targetContainer: AnyStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter :
    (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0});
  if (targetContainer == undefined) {
    let target: Source = creep.pos.findClosestByPath(FIND_SOURCES,{filter :
      (sources) => sources.energy > 0});
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  } else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}

function isNearToTarget(creep: Creep): void {
  let closestSource: Source = creep.pos.findClosestByPath(FIND_SOURCES);
  if (creep.pos.isNearTo(closestSource)) {
    creep.moveTo(creep.room.controller);
  }
}