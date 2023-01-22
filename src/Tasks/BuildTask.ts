import { roleBuilder } from "../Role/RoleBuilder";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleRepairer } from "@/Role/RoleRepairer";
import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { memoryAppend } from "@/MyMemory/MemoryAppend";

export const buildTask = {
  run: function(room: RoomMemory): void {
    newBuilder(room);

    for (let i = 0; i < Memory.roles.builders.length; ++i) {
      let builder = Game.getObjectById(Memory.roles.builders[i]);
      if (builder == null) {
        memoryDelete.delete(i, true, 'builder');
        continue;
      }
      if (room.sites.length == 0) {
        roleRepairer.run(builder, room);
      } else {
        roleBuilder.run(builder, room);
      }
    }
    return;
  }
}

function newBuilder(room: RoomMemory): void {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let builders = Memory.roles.builders;
  let sites = room.sites;
  if (!(sites.length > 0 && builders.length < 2)) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'builder';
  let newName: string = 'Builder' + Game.time;
  let bodys = newCreepBody('builder', room.spawns[0]);
  if (Game.spawns['Spawn1'].spawnCreep(bodys,newName, {memory: {role: 'builder'}}) == OK) {
    ;
  }
  return;
}