import { globalStructure } from "@/global/GlobalStructure"

export const structureLink = {
  run: function(link: StructureLink): void {
    if (globalStructure.fromLinks.includes(link)) {
      transfer(link);
    }
  }
}

function transfer(link: StructureLink): void {
  if (link.store[RESOURCE_ENERGY] >= 100) {
    for (let i = 0; i < globalStructure.toLinks.length; ++i) {
      let energy = globalStructure.toLinks[i].store.getFreeCapacity(RESOURCE_ENERGY);
      if (energy > 10) {
        link.transferEnergy(globalStructure.toLinks[0]);
      }
    }
  }
}