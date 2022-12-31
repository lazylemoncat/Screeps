var myFind = require('./MyFind');

var roleBuilder = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    }
    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if(creep.memory.building) {
      if (Game.spawns["Spawn1"].room != creep.room) {
        creep.moveTo(Game.spawns["Spawn1"]);
      }
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length) {
          if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
    }
    else {
      var sources = myFind.creepFind("closestGetStore", creep);
      if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources);
      }
      if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
	}
};

module.exports = roleBuilder;