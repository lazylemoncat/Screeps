let roleTransfer = {
  run: function(creep) {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }

    if (creep.memory.transfering) {
      goTransfer(creep);
    } else {
      goWithdraw(creep);
    }
  }
}

module.exports = roleTransfer;

function goTransfer(creep) {
  let target = creep.room.find(FIND_STRUCTURES, {
    filter : (structure) => {return (structure.structureType == STRUCTURE_TOWER) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});

  if (target[0] != undefined) {
    if (creep.transfer(targetTower[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetTower[0]);
    }
  } else {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {return (structure.structureType == 
      STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_EXTENSION ||
      structure.structureType == STRUCTURE_SPAWN ||
      structure.structureType == STRUCTURE_TOWER)
      && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  }
}

function goWithdraw(creep) {
  let targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter:
    (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE)&&
    structure.store[RESOURCE_ENERGY] > 0
  });
  if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}