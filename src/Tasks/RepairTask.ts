import { roleRepairer } from "../Role/RoleRepairer";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { memoryAppend } from "@/MyMemory/MemoryAppend";

export const repairTask = {
  run: function(room: RoomMemory): void {
    newRepairer(room);
    for (let i = 0; i < Memory.roles.repairers.length; ++i) {
      let repaier = Game.getObjectById(Memory.roles.repairers[i])
      if (repaier == null) {
        memoryDelete.delete(i, true, 'repairer');
        continue;
      }
      roleRepairer.run(repaier, room);
    }
    return;
  }
}

function newRepairer(room: RoomMemory): void {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let repairers = Memory.roles.repairers;
  let containers = room.containers;
  if (repairers.length >= 1 || containers.length == 0) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'repairer';
  let newName: string = 'Repairer' + Game.time;
  let bodys = newCreepBody('repairer', room.spawns[0])
  if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'repairer'}}) == OK) {
    ;
  }
  return;
}