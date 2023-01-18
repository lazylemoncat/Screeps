import { globalRole } from "../global/GlobalRole";
import { globalStructure } from "../global/GlobalStructure";

export const roleTransfer = {
  run: function(creep: Creep): void {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }
    
    if (creep.memory.transfering) {
      goTransfer(creep);
    } else {
      let links: StructureLink[] = globalStructure.links;
      let containers: StructureContainer[] = globalStructure.containers;
      let sources: Source[] = globalStructure.sources;
      if (links.length == 0 && containers.length < sources.length &&
          sources[creep.memory.sourcesPosition].pos.findInRange(containers, 1).length == 0) {
        goWithdrawCreep(creep);
      } else {
        goWithdraw(creep);
      }
    }
  }
}

function goTransfer(creep: Creep): void {
  let structures: AnyStructure[] = creep.room.find(FIND_STRUCTURES);
  let target: AnyStructure[] = structures.filter(structure => 
    (structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 );
  if (target[0] != undefined) {
    let temp: AnyStructure = creep.pos.findInRange(target, 3)[0];
    if (temp != undefined) {
      target[0] = temp;
    }
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = structures.filter(structure => 
    (structure.structureType == STRUCTURE_TOWER) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  if (target[0] != undefined) {
    let temp: AnyStructure = creep.pos.findInRange(target, 6)[0];
    if (temp != undefined) {
      target[0] = temp;
    }
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = structures.filter(structure =>
    ((structure.structureType == STRUCTURE_CONTAINER &&
    structure.pos.findInRange(globalStructure.sources, 1)[0] == undefined) ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]);
  if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target[0]);
  }
}

function goWithdrawCreep(creep: Creep) {
  let source = globalStructure.sources[creep.memory.sourcesPosition];
  if (globalRole.transferTarget[0] != undefined) {
    let target: Creep[] = source.pos.findInRange(FIND_CREEPS, 1, {filter: creep=>
      creep.memory.role == 'harvester'});
    if (target != undefined) {
      let targetId: number = globalRole.transferTarget.indexOf(target[0].id);
      creep.memory.transferTarget = globalRole.transferTarget[targetId];
    }
  }
  if (Game.getObjectById(creep.memory.transferTarget) != null) {
    let res: number = creep.transferTo(Game.getObjectById(creep.memory.transferTarget), creep);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.getObjectById(creep.memory.transferTarget));
      return;
    } else if (res == OK) {
      creep.memory.transferTarget = undefined;
    }
  }
  if (creep.pos.getRangeTo(source) > 2) {
    creep.moveTo(source);
    return;
  }
}

function goWithdraw(creep: Creep): void {
  let resources = creep.room.find(FIND_DROPPED_RESOURCES);
  if (resources[0] != undefined) {
    if (creep.pickup(resources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(resources[0]);
    }
    return;
  }
  if (globalStructure.toLinks.length > 0 && 
      creep.memory.sourcesPosition.findInRange(globalStructure.fromLinks, 1).length != 0) {
    let link = Game.getObjectById(globalStructure.toLinks[0].id);
    if (link != null && link.store[RESOURCE_ENERGY] >= 100) {
      if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(link);
      }
      return;
    }
  }
  let targetSource: Source = globalStructure.sources[creep.memory.sourcesPosition];
  let targetContainer: StructureContainer = targetSource.pos.findInRange(globalStructure.containers, 1)[0];
  if (targetContainer == null || 
      targetContainer.store[RESOURCE_ENERGY] <= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
    targetContainer = globalStructure.containers.filter(target => 
      target.pos.findInRange(globalStructure.sources, 1)[0] != undefined && 
      Game.getObjectById(target.id).store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))[0];
    if (targetContainer == undefined) {
      targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter:
        (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
        structure.structureType == STRUCTURE_STORAGE)&&
        structure.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
        });
    }
  }
  if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}