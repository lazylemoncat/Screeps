let roleHarvester = {
  run: function(creep) {
    // if harvester's free capacity more than 0, harvest energy
    if(creep.store.getFreeCapacity() > 0) {
      goHarvest(creep);
    } else {
      backRoom(creep);
      transferEnergy(creep);
    }
	}
};

module.exports = roleHarvester;

function backRoom(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
  }
}

function goHarvest(creep) {
  let targetSource = creep.room.find(FIND_SOURCES)[creep.memory.sourcesPosition];
  if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetSource);
  }
}

function transferEnergy(creep) {
  let transferTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE ||
    structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN ||
    structure.structureType == STRUCTURE_TOWER)
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if(creep.transfer(transferTo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(transferTo);
  }
}