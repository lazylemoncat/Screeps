import { memoryAppend } from "@/MyMemory/MemoryAppend";

export const structureSpawn = {
  appendMemory: function(room: RoomMemory): void {
    for (let i = 0; i < room.spawns.length; ++i) {
      let spawn = Game.getObjectById(room.spawns[i]);
      if (spawn.spawning != null) {
        let id = Game.creeps[Game.spawns['Spawn1'].spawning.name].id;
        let role = Game.creeps[Game.spawns['Spawn1'].spawning.name].memory.role;
        memoryAppend.append(id, true, role);
      }
    }
    return;
  }
}