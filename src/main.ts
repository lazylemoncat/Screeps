// helper
import './helper/helper';
// MyMemory
import { memoryRefresh } from './MyMemory/MemoryRefresh';
// Prototype
import './Prototype/CreepPrototype';
// Structure
import { structureLink } from './Structure/StructureLink';
import { structureTower } from './Structure/StructureTower';
// tasks
import { harvestTask } from './Tasks/HarvestTask';
import { outerTask } from './Tasks/OuterTask';
import { transferTask } from './Tasks/TransferTask';
import { upgradeTask } from './Tasks/UpgradeTask';
import { buildTask } from './Tasks/BuildTask';
import { repairTask } from './Tasks/RepairTask';
// import { claimTask } from './Tasks/ClaimTask';
import { structureSpawn } from './Structure/StructureSpawn';
import { memoryDelete } from './MyMemory/MemoryDelete';
import { roleAttacker } from './Role/RoleAttacker';


memoryRefresh.refresh();
export const loop = function (): void {
  if(Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
  // 重置 memory
  if (Game.time % 100 == 0) {
    memoryRefresh.refresh();
  }
  for (let name in Memory.rooms) {
    let room = Memory.rooms[name];
    structureSpawn.appendMemory(room);
    // 执行任务
    harvestTask.run(room);
    transferTask.run(room);
    buildTask.run(room);
    upgradeTask.run(room);
    repairTask.run(room);
    outerTask.run();
    //claimTask.run('W59S26');
    // todo
    // for (let i = 0; i < Memory.roles.attackers.length; ++i) {
    //   let attacker =Game.getObjectById(Memory.roles.attackers[i]);
    //   if (attacker == null) {
    //     memoryDelete.delete(i, true, 'attacker');
    //   }
    //   roleAttacker.run(attacker, 'W58S25');
    // }
    // 执行建筑的run函数
    for (let name in Game.structures) {
      let structure = Game.structures[name];
      switch (structure.structureType) {
        case STRUCTURE_TOWER : structureTower.run(structure as StructureTower); break;
        case STRUCTURE_LINK : structureLink.run(structure as StructureLink, room); break;
      }
    }
  }
  return;
}