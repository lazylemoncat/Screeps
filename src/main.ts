// MyMemory
import { memoryRefresh } from './MyMemory/MemoryRefresh';
// Structure
import { structureLink } from './Structure/StructureLink';
import { structureTower } from './Structure/StructureTower';
// tasks
import { harvestTask } from './Tasks/HarvestTask';
import { transferTask } from './Tasks/TransferTask';
import { upgradeTask } from './Tasks/UpgradeTask';
import { buildTask } from './Tasks/BuildTask';
import { repairTask } from './Tasks/RepairTask';

export const loop = function (): void {
  if(Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
  if (Game.spawns.Spawn1 != undefined) {
    // refresh memory
    if (Game.time % 10 == 0) {
      memoryRefresh.refresh();
    }
    for (let name in Memory.rooms) {
      let room = Memory.rooms[name];
      // run tasks
      harvestTask.run(room);
      transferTask.run(room);
      buildTask.run(room);
      upgradeTask.run(room);
      repairTask.run(room);
      // run structures
      for (let name in Game.structures) {
        let structure = Game.structures[name];
        switch (structure.structureType) {
          case STRUCTURE_TOWER : structureTower.run(structure as StructureTower); break;
          case STRUCTURE_LINK : structureLink.run(structure as StructureLink, room); break;
        }
      }
    }
  }
}