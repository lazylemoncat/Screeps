import { globalStructure } from "../global/GlobalStructure";

export const roleHarvester = {
  run: function(creep: Creep): void {
    let transfered: boolean = false;
    if (creep.store.getFreeCapacity() == 0) {
      transfered = transferEnergy(creep);
    }
    goHarvest(creep, transfered);
	}
};

function goHarvest(creep: Creep, transfered: boolean): void {
  let source: Source = globalStructure.sources[creep.memory.sourcesPosition];
  if (!creep.pos.isNearTo(source)) {
    creep.moveTo(source);
    return;
  }
  if (source.energy == 0 || 
      creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
    return;
  }
  let container: StructureContainer[] = creep.pos.findInRange(globalStructure.containers, 1);
  if (container[0] != undefined) {
    if (!creep.pos.isEqualTo(container[0])) {
      creep.moveTo(container[0]);
    }
  }
  creep.harvest(source);
}

function transferEnergy(creep: Creep): boolean {
  let links: StructureLink[] = globalStructure.links;
  let containers: StructureContainer[] = globalStructure.containers;
  let sources: Source[] = globalStructure.sources;
  if (links.length == 0 && containers.length < sources.length &&
      creep.pos.findInRange(containers, 1).length == 0) {
    creep.transferTo(creep);
    return false;
  }
  if (!transfer(creep)) {
    return false;
  }
  return true;
}

function transfer(creep: Creep): boolean {
  let link: StructureLink = creep.pos.findInRange(globalStructure.fromLinks, 1)[0];
  if (link != undefined) {
    let targetLink: StructureLink = Game.getObjectById(link.id);
    if (creep.transfer(targetLink, RESOURCE_ENERGY) == OK) {
      return true;
    }
    return false;
  }
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
  return false;
}