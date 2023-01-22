import { memoryAppend } from "@/MyMemory/MemoryAppend";
import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { roleMiner } from "@/Role/RoleMiner";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleHarvester } from "../Role/RoleHarvester";

export const harvestTask = {
  run: function(room: RoomMemory): void {
    newCreep(room);

    for (let i = 0; i < Memory.roles.harvesters.length; ++i) {
      let harvester = Game.getObjectById(Memory.roles.harvesters[i]);
      if (harvester == null) {
        memoryDelete.delete(i, true, 'harvester');
        continue;
      }
      roleHarvester.run(harvester, room);
    }
    for (let i = 0; i < Memory.roles.miners.length; ++i) {
      let miner = Game.getObjectById(Memory.roles.miners[i]);
      if (miner == null) {
        memoryDelete.delete(i, true, 'miner');
        continue;
      }
      roleMiner.run(miner, room);
    }
    return;
  }
}

function newCreep(room: RoomMemory): void {
  let harvesters = Memory.roles.harvesters;
  let carriers = Memory.roles.carriers;
  let sources = room.sources;
  Game.spawns['Spawn1'].memory.shouldSpawn = null;
  if (harvesters.length <= carriers.length && harvesters.length < sources.length) {
    Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
    newHarvester(harvesters, sources.length, room);
  }
  
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let miners = Memory.roles.miners;
  if (miners.length < 1 && harvesters.length + carriers.length >= sources.length * 2) {
    let extractor = Game.getObjectById(room.mineral).pos.findInRange(FIND_STRUCTURES, 0)[0];
    if (extractor != null) {
      Game.spawns['Spawn1'].memory.shouldSpawn = 'miner';
      let newName: string = "Miner" + Game.time;
      let bodys = newCreepBody('harvester', room.spawns[0]);
      Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'miner'}});
    }
  }
  return;
}

function newHarvester(harvesters: Id<Creep>[], sourcesLength: number, room: RoomMemory): void{
  let posFlag: number = 0;
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < harvesters.length; ++j) {
      let harvester = Game.getObjectById(harvesters[j]);
      if (Game.getObjectById(room.sources[i]).id == harvester.memory.sourcesPosition) {
        posFlag += 1;
        break;
      }
    }
    if (posFlag == i) break;
  }
  if (posFlag >= sourcesLength) return;

  let newName: string = "Harvester" + Game.time;
  let sourceId = Game.getObjectById(room.sources[posFlag]).id as Id<Source>;
  let memory = {role: 'harvester', sourcesPosition: sourceId};
  let bodys = newCreepBody('harvester', room.spawns[0]);
  if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: memory}) == OK) {
    ;
  }
  return;
}