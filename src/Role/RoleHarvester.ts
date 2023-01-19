import { tasks } from "../Tasks/Tasks";

export const roleHarvester = {
  run: function(creep: Creep, room: RoomMemory): void {
    let transfered: boolean = false;
    if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK) * 2) {
      transfered = transferEnergy(creep, room);
    }
    goHarvest(creep, transfered, room);
	}
};

function goHarvest(creep: Creep, transfered: boolean, room: RoomMemory): void {
  let source: Source = Game.getObjectById(room.sources[creep.memory.sourcesPosition]);
  if (!creep.pos.isNearTo(source)) {
    creep.moveTo(source);
    return;
  }
  if (source.energy == 0 || 
      creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
    return;
  }
  let container: StructureContainer[] = source.pos.findInRange(FIND_STRUCTURES, 1).
    filter(structure => structure.structureType == STRUCTURE_CONTAINER) as StructureContainer[];
  if (container[0] != undefined) {
    if (!creep.pos.isEqualTo(container[0])) {
      creep.moveTo(container[0]);
    }
  }
  creep.harvest(source);
}

function transferEnergy(creep: Creep, room: RoomMemory): boolean {
  if (Game.getObjectById(creep.memory.waiting) != null) {
    return;
  }
  let links: Id<StructureLink>[] = room.links;
  let containers: Id<StructureContainer>[] = room.containers;
  let sources: Id<Source>[] = room.sources;
  if (links.length == 0 && containers.length < sources.length &&
      creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure => 
      structure.structureType == STRUCTURE_CONTAINER).length == 0) {
    if (!tasks.withdraw.creep.includes(creep.id)) {
      tasks.withdraw.creep.push(creep.id);
    }
    return false;
  }
  if (!transfer(creep)) {
    return false;
  }
  return true;
}

function transfer(creep: Creep): boolean {
  let link: StructureLink = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure =>
    structure.structureType == STRUCTURE_LINK)[0] as StructureLink;
  if (link != undefined) {
    let targetLink: StructureLink = Game.getObjectById(link.id);
    if (creep.transfer(targetLink, RESOURCE_ENERGY) == OK) {
      return true;
    }
    return false;
  }
  let container: StructureContainer = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure =>
    structure.structureType == STRUCTURE_CONTAINER)[0] as StructureContainer;
  if (container != undefined) {
    if (creep.transfer(container, RESOURCE_ENERGY) == OK) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}