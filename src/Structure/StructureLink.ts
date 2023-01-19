import { globalStructure } from "@/global/GlobalStructure"

export const structureLink = {
  run: function(link: StructureLink): void {
    for (let i = 0; i < globalStructure.fromLinks.length; ++i) {
      if (globalStructure.fromLinks[i].id == link.id) {
        transfer(link);
        break;
      }
    }
  },
}

function transfer(link: StructureLink): void {
  if (link.store[RESOURCE_ENERGY] >= 100) {
    for (let i = 0; i < globalStructure.toLinks.length; ++i) {
      let energy = Game.getObjectById(globalStructure.toLinks[i].id).store.getFreeCapacity(RESOURCE_ENERGY);
      if (energy > 10) {
        link.transferEnergy(Game.getObjectById(globalStructure.toLinks[i].id));
        return;
      }
    }
  }
}