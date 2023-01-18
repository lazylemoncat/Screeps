import { globalStructure } from "@/global/GlobalStructure";
import { newCreepBody } from "./NewCreepBodys";

export const newCreeps = {
  run: function(): number {
    if (Game.spawns.Spawn1.room.energyAvailable < 200) {
      return 0;
    }

    // if builders less than 1 and sites exist, creat it
    let builders: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    let sites: ConstructionSite[] = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length != 0 && builders.length < 1) {
      newBuilder();
      return 0;
    }


    // if repairer less than 1, creat it
    let repairer: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    if (globalStructure.containers.length > 1 && repairer.length < 1) {
      newRepairer();
      return 0; 
    }
    return -1;
  }
}



function newBuilder() {
  let newName: string = 'Builder' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
    memory: {role: 'builder'}});
}



function newRepairer() {
  let newName: string = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}