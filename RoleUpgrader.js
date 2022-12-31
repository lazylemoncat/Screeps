var myFind = require('./MyFind');

var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {

    var targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, 
      {
        filter: (structure) =>
        {
          return (structure.structureType == STRUCTURE_CONTAINER &&
            structure.store[RESOURCE_ENERGY] > 0);
        }
      });
    if (targetContainer == null || targetContainer.store == 0) {
      targetContainer = creep.pos.findClosestByPath(FIND_SOURCES);
    }

    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say('harvest');
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say('upgrade');
    }

    if(creep.memory.upgrading) {
      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
    else {
      if (targetContainer == creep.pos.findClosestByPath(FIND_SOURCES)) {
        if (creep.harvest(targetContainer) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetContainer);
        }
      }
      else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetContainer);
      }
    }
	}
};

module.exports = roleUpgrader;