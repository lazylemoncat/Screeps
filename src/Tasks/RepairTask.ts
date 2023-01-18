import { roleRepairer } from "../Role/RoleRepairer";
import { globalStructure } from "../global/GlobalStructure";
import { newCreepBody } from "../NewCreep/NewCreepBodys";

export const repairTask = {
  run: function() {
    let repairers: Id<Creep>[] = Memory.roles.repaiers;
    let containers: StructureContainer[] = globalStructure.containers;
    if (repairers.length < 1 && containers.length > 0) {
      newRepairer();
    }
    for (let i = 0; i < repairers.length; ++i) {
      roleRepairer.run(Game.getObjectById(repairers[i]));
    }
  }
}

function newRepairer() {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'repairer';
  let newName: string = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}