export const roleRepairer = {
  run: function(creep: Creep): void {
    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
    } else if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      goRepair(creep);
      backRoom(creep);
    } else {
      goGetEnergy(creep);
    }
  }
}

function backRoom(creep: Creep): void {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
  }
}

function goRepair(creep: Creep): void {
  let injured: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax});
  let targetTo: AnyStructure[] = injured.filter(structure => structure.structureType != STRUCTURE_WALL);
  if (targetTo[0] == undefined) {
    targetTo = injured.sort((a,b) => a.hits - b.hits);
  }
  if (creep.repair(targetTo[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetTo[0]);
  }
}

function goGetEnergy(creep: Creep): void {
  let targetEnergy: AnyStoreStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE)
    && structure.store[RESOURCE_ENERGY] > 0}});
  if (targetEnergy == null) {
    let targetsource: Source = creep.pos.findClosestByPath(FIND_SOURCES);
    if(creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetsource);
    }
  } else {
    if (creep.withdraw(targetEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetEnergy);
      }
  }
}