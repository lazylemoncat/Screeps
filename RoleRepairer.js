var myFind = require('./MyFind');

var roleRepairer = {
  run: function(creep) {
    var targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, 
      {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER
      && structure.store[RESOURCE_ENERGY] > 0)}});
    var targetTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax});
    if (creep.store.getFreeCapacity() == creep.store.getCapacity()) {
      if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetContainer);
      }
    } else if (creep.repair(targetTo) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetTo);
    }
  }
}

module.exports = roleRepairer;