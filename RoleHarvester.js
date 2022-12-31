var myFind = require('./MyFind');

var roleHarvester = {
  /** @param {Creep} creep **/
  run: function(creep) {
    
    // find harvester's source target by its sourcesPosition
    var targetSources = creep.room.find(FIND_SOURCES)[creep.memory.sourcesPosition];
    // if harvester's free capacity more than 0, harvest energy
    if(creep.store.getFreeCapacity() > 0) {
      if(creep.harvest(targetSources) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetSources);
      }
    } else if (Game.spawns["Spawn1"].room != creep.room) {
      creep.moveTo(Game.spawns["Spawn1"]);
    } else {
      var transferTo = myFind.creepFind("closestTransferTo", creep);
      if(creep.transfer(transferTo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(transferTo);
      }
    }
	}
};

module.exports = roleHarvester;