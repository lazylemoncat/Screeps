export const roleUpgrader = {
  run: function(creep) {
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

function goUpgrade(creep) {
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

function goGetEnergy(creep) {
  let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter :
    (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0});
  
  if (target == undefined) {
    target = creep.pos.findClosestByPath(FIND_SOURCES,{filter :
      (sources) => sources.energy > 0});
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  } else if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}

function isNearToTarget(creep) {
  let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
  if (creep.pos.isNearTo(closestSource)) {
    creep.moveTo(creep.room.controller);
  }
}