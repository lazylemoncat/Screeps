let roleUpgrader = {
  run: function(creep) {
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      goGetEnergy(creep);
    }
    else if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      goUpgrade(creep);
    }
	}
};

module.exports = roleUpgrader;

function goUpgrade(creep) {
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

function goGetEnergy(creep) {
  let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter :
    (structure) => structure.structureType == STRUCTURE_CONTAINER});
  
  if (target == undefined) {
    target = creep.pos.findClosestByPath(FIND_SOURCES);
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  } else if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}