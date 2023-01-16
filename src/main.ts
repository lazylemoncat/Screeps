// global
import { refreshGlobal } from './global/RefreshGlobal';
// NewCreep
import { newCreeps } from './NewCreep/NewCreeps';
// Role
import { roleAttacker } from './Role/RoleAttacker';
import { roleBuilder } from './Role/RoleBuilder';
import { roleClaimer } from './Role/RoleClaimer';
import { roleHarvester } from './Role/RoleHarvester';
import { roleHealer } from './Role/RoleHealer';
import { roleRepairer } from './Role/RoleRepairer';
import { roleTransfer } from './Role/RoleTransfer';
import { roleUpgrader } from './Role/RoleUpgrader';
// Structure
import { structureLink } from './Structure/StructureLink';
import { structureTower } from './Structure/StructureTower';

export const loop = function (): void {
  if (Game.spawns.Spawn1 != undefined) {
    // refresh global variable
    if (Game.time % 100 == 0) {
      refreshGlobal();
    }
    if (Game.spawns.Spawn1 != undefined) {
      // create new creeps
      newCreeps.run()
      // run creeps
      for (let name in Game.creeps) {
        let creep: Creep = Game.creeps[name];
        switch (creep.memory.role) {
          case 'harvester' : roleHarvester.run(creep); break;
          case 'upgrader' : roleUpgrader.run(creep); break;
          case 'builder' : roleBuilder.run(creep); break;
          case 'transfer' : roleTransfer.run(creep); break;
          case 'repairer' : roleRepairer.run(creep); break;
          case 'attacker' : roleAttacker.run(creep); break;
          case 'healer' : roleHealer.run(creep); break;
          case 'claimer' : roleClaimer.run(creep); break;
        }
      }
      // run structures
      for (let name in Game.structures) {
        let structure = Game.structures[name];
        switch (structure.structureType) {
          case STRUCTURE_TOWER : structureTower.run(structure as StructureTower); break;
          case STRUCTURE_LINK : structureLink.run(structure as StructureLink); break;
        }
      }
    }
  }
}