import { globalStructure } from './GlobalStructure';
import { globalAutoSites } from './GlobalAutoSites';
import { globalRole } from './GlobalRole';
/**
 * @file to refresh global veriables
 * @author LazyKitty
 */
export const refreshGlobal = function() {
  // GlobalStructure.ts
  if (Game.spawns.Spawn1 != undefined) {
    globalStructure.refresh();
    globalAutoSites.run();
    globalRole.refresh();
  }
}