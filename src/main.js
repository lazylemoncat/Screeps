import { roleHarvester } from './Role/RoleHarvester';
import { roleBuilder } from './Role/RoleBuilder';
import { roleUpgrader } from './Role/RoleUpgrader';
import { roleAttacker } from './Role/RoleAttacker';
import { roleHealer } from './Role/RoleHealer';
import { roleRepairer } from './Role/RoleRepairer';
import { roleTransfer } from './Role/RoleTransfer';

import { structureTower } from './Structure/StructureTower';

import { newCreeps } from './NewCreep/NewCreeps';

import { war } from './war/war';

export const loop = function () {
  // create new creeps
  if (newCreeps.run() == -1) {
    // war.run('W55S22');
  }
  // run creeps
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'transfer') {
      roleTransfer.run(creep);
    }
    if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
    if (creep.memory.role == 'attacker') {
      roleAttacker.run(creep);
    }
    if (creep.memory.role == 'healer') {
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