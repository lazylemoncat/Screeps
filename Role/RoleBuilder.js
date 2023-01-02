let roleBuilder = {
  run: function (creep) {
    backRoom(creep);
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
  }
}

function goBuild(creep) {
  let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if(target) {
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
}

function goGetEnergy(creep) {
  let arr1 = creep.room.find(FIND_SOURCES);
  let targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {
    return (structure.structureType == STRUCTURE_CONTAINER &&
    structure.store[RESOURCE_ENERGY] > 0)}});
  if (targetContainer != null) {
    arr1.push(targetContainer);
  }
  let targetSource = creep.pos.findClosestByPath(arr1);
  if (creep.withdraw(targetSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetSource);
  }
  if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
  }
}