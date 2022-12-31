var myFind = {

  spawnFind : function(str, spawn) {
    switch(str) {
      case "closestSource" : return Game.spawns[spawn].pos.findClosestByPath(FIND_SOURCES);
    }
  },

  creepFind : function(str, creep) {
    switch(str) {
      case "closestSource" : return creep.pos.findClosestByPath(FIND_SOURCES);
      case "closestGetStore" : {
        var arr1 = creep.room.find(FIND_SOURCES);
        var targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, 
          {filter: (structure) => {
          return (structure.structureType == STRUCTURE_CONTAINER &&
          structure.store[RESOURCE_ENERGY] > 0)}});
        if (targetContainer != null) {
          arr1.push(targetContainer);
        }
        return creep.pos.findClosestByPath(arr1);
      }
      case "closestTransferTo" : return creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {return (structure.structureType == 
        STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_EXTENSION ||
        structure.structureType == STRUCTURE_SPAWN)
        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
    }
  }
}

module.exports = myFind;