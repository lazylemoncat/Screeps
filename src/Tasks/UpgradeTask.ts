import { roleUpgrader } from "../Role/RoleUpgrader";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { memoryAppend } from "@/MyMemory/MemoryAppend";

export const upgradeTask = {
  run: function(room: RoomMemory): void {
    newUpgrader(room);
    for (let i = 0; i < Memory.roles.upgraders.length; ++i) {
      let upgrader = Game.getObjectById(Memory.roles.upgraders[i]);
      if (upgrader == null) {
        memoryDelete.delete(i, true, 'upgrader');
        continue;
      }
      roleUpgrader.run(upgrader, room);
    }
    return;
  }
}

function newUpgrader(room: RoomMemory): void {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let upgradersNum = room.sites.length > 0 ? 1 : 3;
  if (Game.getObjectById(room.controller).level == 8) {
    upgradersNum = 1;
  }
  if (Memory.roles.upgraders.length >= upgradersNum) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'upgrader';
  let newName: string = 'Upgrader' + Game.time;
  let bodys = newCreepBody('upgrader', room.spawns[0]);
  if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'upgrader'}}) == OK) {
    ;
  }
  return;
}