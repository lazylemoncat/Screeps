var myFind = require('./MyFind');

var roleTransfer = {
  run: function(creep) {
    var targetContainer = myFind.creepFind("closestGetStore", creep);
    var targetTo = myFind.creepFind("closestTransferTo", creep);
    var targetTower = creep.room.find(FIND_STRUCTURES, {
      filter : (structure) => {return (structure.structureType == STRUCTURE_TOWER) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});
    
    if (creep.store.getFreeCapacity() > 0) {
      if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetContainer);
      }
    } else {
      if (targetTower[0]) {
        if (creep.transfer(targetTower[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetTower[0]);
        }
      }
      else if (creep.transfer(targetTo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetTo);
      }
    }
  }
}

module.exports = roleTransfer;