import { roleBuilder } from "../Role/RoleBuilder";
import { globalStructure } from "../global/GlobalStructure";
import { newCreepBody } from "../NewCreep/NewCreepBodys";

export const buildTask = {
  run: function() {
    let builders: Id<Creep>[] = Memory.roles.builders;
    let sites: ConstructionSite[] = globalStructure.sites;
    if (sites.length > 0 && builders.length < 1) {
      newBuilder();
    }
    for (let i = 0; i < builders.length; ++i) {
      roleBuilder.run(Game.getObjectById(builders[i]));
    }
  }
}

function newBuilder() {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'builder';
  let newName: string = 'Builder' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
    memory: {role: 'builder'}});
}