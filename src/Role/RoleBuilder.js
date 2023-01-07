let roleBuilder = {
  run: function (creep) {
    if (backRoom(creep) == 0) {
      return;
    }
    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    } else if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if(creep.memory.building) {
      goBuild(creep);
    } else {
      goGetEnergy(creep);
    }
	}
};

module.exports = roleBuilder;

function backRoom(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}

function goBuild(creep) {
  let target = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(target[0]) {
      if(creep.build(target[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
}

function goGetEnergy(creep) {
  let targetStore = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0}});

  if (targetStore != null) {
    if (creep.withdraw(targetStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetStore);
    }
    return;
  } else {
    let soureces = creep.room.find(FIND_SOURCES, {filter :
      (sources) => sources.energy > 0});
    if (creep.harvest(soureces[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(soureces[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return;
  }
}