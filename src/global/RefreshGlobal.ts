import { globalStructure } from './GlobalStructure';
import './GlobalRole';
/**
 * @file to refresh global veriables
 * @author LazyKitty
 */
export const refreshGlobal = function() {
  // GlobalStructure.ts
  if (Game.spawns.Spawn1 != undefined) {
    globalStructure.refresh();
  }
  // GlobalRole.ts
  // harvester
  global.harvestPath = [];
  // repairer
  global.repairerTarget = null;
}