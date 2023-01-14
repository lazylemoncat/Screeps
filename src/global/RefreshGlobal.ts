import './GlobalStructure';
import './GlobalRole';

export const refreshGlobal = function() {
  // GlobalStructure.ts
  // get Container[]
  global.containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES,{filter:
    structure => structure.structureType == STRUCTURE_CONTAINER
  });
  // GlobalRole.ts
  // repairer
  global.repairerTarget = null;
}