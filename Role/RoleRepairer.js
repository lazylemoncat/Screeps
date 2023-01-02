let roleRepairer = {
  run: function(creep) {
    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
    } else if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      goRepair(creep);
    } else {
      goGetEnergy(creep);
    }
  }
}

module.exports = roleRepairer;

function goRepair(creep) {
  let targetTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax});
  if (creep.repair(targetTo) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetTo);
  }
}

function goGetEnergy(creep) {
  let targetEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER
    && structure.store[RESOURCE_ENERGY] > 0)}});
  if (targetEnergy == null) {
    targetEnergy = creep.pos.findClosestByPath(FIND_SOURCES);
    if(creep.harvest(targetEnergy) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetEnergy);
    }
  } else {
    if (creep.withdraw(targetEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetEnergy);
      }
  }
}