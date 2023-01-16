import { globalStructure } from "@/global/GlobalStructure";
import { newCreepBody } from "../NewCreep/NewCreepBodys";

export const roleHarvester = {
  run: function(creep: Creep): void {
    // if harvester went into the wrong room
    if (backRoom(creep) == 0) {
      return;
    }
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.harvesting = true;
    } else if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
      if (transfer(creep) != true) {
        creep.memory.harvesting = false;
      }
    }
    // if harvester's free capacity more than 0, harvest energy
    if (creep.memory.harvesting) {
      goHarvest(creep);
    } else {
      transferEnergy(creep);
    }
    if (creep.ticksToLive <= 30 && !creep.memory.dying) {
      newOne(creep);
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
  let targetSource: Source = globalStructure.sources[creep.memory.sourcesPosition];
  if (targetSource.energy == 0) return;
  let container = globalStructure.containers.filter(structure =>
    structure.pos.isNearTo(targetSource as Source));
  if (container[0] != undefined) {
    if (container[0].store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
        creep.getActiveBodyparts(CARRY) == 0) {
      return;
    } 
    if (!creep.pos.isEqualTo(container[0]) &&
        creep.pos.isNearTo(targetSource)) {
      creep.moveTo(container[0]);
      return;
    }
  }
  
  if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
    if (global.harvestPath[creep.memory.sourcesPosition] == undefined) {
      global.harvestPath[creep.memory.sourcesPosition] = creep.room.findPath(creep.pos, targetSource.pos);
    }
    creep.moveByPath(global.harvestPath[creep.memory.sourcesPosition]);
  }
}

function transferEnergy(creep: Creep): void {
  let source: Source = globalStructure.sources[creep.memory.sourcesPosition];

  if (globalStructure.links[0] != undefined && creep.getActiveBodyparts(CARRY) >= 1) {
    let link: StructureLink[] = creep.pos.findInRange(globalStructure.fromLinks, 3).filter(
      link => link.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (link[0] != undefined) {
      if (creep.transfer(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(link[0]);
      }
      return;
    }
  }
  
  let container: StructureContainer = source.pos.findInRange(globalStructure.containers, 1)[0];
  if (container != undefined && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
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

function newOne(creep: Creep): void {
  let spawns: StructureSpawn[] = creep.room.find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_SPAWN});
  let newName: string = 'Harvester' + Game.time;
  let error: number = Game.spawns[spawns[0].name].spawnCreep(newCreepBody('harvester'), 
    newName, {memory: {role: 'harvester', sourcesPosition: creep.memory.sourcesPosition}});
  if (error == OK) {
    creep.memory.dying = true;
  }
}

function transfer(creep: Creep): boolean {
  let link: StructureLink = creep.pos.findInRange(globalStructure.fromLinks, 1)[0];
  if (link != undefined) {
    if (creep.transfer(link, RESOURCE_ENERGY) == OK) {
      return true;
    } else {
      return false;
    }
  } else {
    let source: Source = globalStructure.sources[creep.memory.sourcesPosition];
    let container: StructureContainer = globalStructure.containers.filter(structure =>
      structure.pos.isNearTo(source))[0];
    if (container != undefined) {
      if (creep.transfer(container, RESOURCE_ENERGY) == OK) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
}