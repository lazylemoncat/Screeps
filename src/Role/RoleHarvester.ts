export const roleHarvester = {
  run: function(creep: Creep): void {
    // if harvester went into the wrong room
    if (backRoom(creep) == 0) {
      return;
    }
    if(!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.harvesting = true;
    } else if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
      creep.memory.harvesting = false;
    }
    // if harvester's free capacity more than 0, harvest energy
    if(creep.memory.harvesting) {
      goHarvest(creep);
    } else {
      transferEnergy(creep);
    }
	}
};

function backRoom(creep: Creep): number {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}

function goHarvest(creep: Creep): void {
  let targetSource: _HasId = Game.getObjectById(creep.memory.sourcesPosition);
  if(creep.harvest(targetSource as Source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetSource as Source);
  }
}

function transferEnergy(creep: Creep): void {
  let container: StructureContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
  });
  if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(container);
    }
    return;
  }

  let structures: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {return (structure.structureType == STRUCTURE_STORAGE ||
    structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN ||
    structure.structureType == STRUCTURE_TOWER)
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });

  let transferTo: AnyStructure[] = structures.filter(structure => 
    structure.structureType == STRUCTURE_EXTENSION);
  let target: AnyStructure;
  if (transferTo[0] == undefined) {
    target = creep.pos.findClosestByPath(structures);
  } else {
    target = creep.pos.findClosestByPath(transferTo);
  }

  if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}