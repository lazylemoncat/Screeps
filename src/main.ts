import { roleHarvester } from './Role/RoleHarvester';
import { roleBuilder } from './Role/RoleBuilder';
import { roleUpgrader } from './Role/RoleUpgrader';
import { roleAttacker } from './Role/RoleAttacker';
import { roleHealer } from './Role/RoleHealer';
import { roleRepairer } from './Role/RoleRepairer';
import { roleTransfer } from './Role/RoleTransfer';

import { structureTower } from './Structure/StructureTower';

import { newCreeps } from './NewCreep/NewCreeps';

export const loop = function (): void {
  // create new creeps
  newCreeps.run()
  // run creeps
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    else if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    else if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    else if (creep.memory.role == 'transfer') {
      roleTransfer.run(creep);
    }
    else if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
    else if (creep.memory.role == 'attacker') {
      roleAttacker.run(creep);
    }
    else if (creep.memory.role == 'healer') {
      roleHealer.run(creep);
    }
  }
  // run structures
  for (let name in Game.structures) {
    let structure = Game.structures[name];
    if (structure.structureType == STRUCTURE_TOWER) {
      structureTower.run(structure);
    }
  }
}