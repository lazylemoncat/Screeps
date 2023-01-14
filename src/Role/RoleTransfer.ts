export const roleTransfer = {
  run: function(creep: Creep): void {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }

    if (backRoom(creep) == 0) {
      return;
    }
    if (creep.memory.transfering) {
      goTransfer(creep);
    } else {
      goWithdraw(creep);
    }
  }
}

function backRoom(creep: Creep): number {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}


function goTransfer(creep: Creep): void {
  let structures: AnyStructure[] = creep.room.find(FIND_STRUCTURES);
  let target: AnyStructure[] = structures.filter(structure => 
    (structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 );
  if (target[0] != undefined) {
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = structures.filter(structure => 
    (structure.structureType == STRUCTURE_TOWER) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  if (target[0] != undefined) {
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = structures.filter(structure =>
    (structure.structureType == STRUCTURE_CONTAINER &&
    structure.pos.isNearTo(structure.pos.findClosestByPath(FIND_SOURCES)) == false) ||
    structure.structureType == STRUCTURE_STORAGE &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target[0]);
  }
}

function goWithdraw(creep: Creep): void {
  let targetSource: _HasId = Game.getObjectById(creep.memory.sourcesPosition);
  let targetContainer: AnyStructure = (targetSource as Source).pos.findClosestByPath(FIND_STRUCTURES, {filter:
    (structure) => (structure.structureType == STRUCTURE_CONTAINER)});
  if (targetContainer == null || 
    (targetContainer as StructureContainer).store[RESOURCE_ENERGY] <= creep.store.getFreeCapacity[RESOURCE_ENERGY]) {
    targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter:
      (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
      structure.structureType == STRUCTURE_STORAGE)&&
      structure.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity[RESOURCE_ENERGY]
    });
  }
  if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}