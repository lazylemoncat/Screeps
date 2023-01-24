import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { newCreepBody } from "@/NewCreep/NewCreepBodys";

export const outerTask = {
  run: function(): void {
    for (let i = 0; i < Memory.Outer.length; ++i) {
      let room = Memory.Outer[i];
      if (Game.flags.outer == undefined) {
        let flag = Game.flags[Game.spawns.Spawn1.pos.createFlag('outer')];
        flag.setPosition(new RoomPosition(25, 25, room.roomName));
        flag.remove();
      }
      if (room.isInit != true) {
        initRoom(i);
      }
      //newCreep(i);
    }
    for (let i = 0; i < Memory.roles.outer_harvesters.length; i++) {
      let harvester = Game.getObjectById(Memory.roles.outer_harvesters[i]);
      if (harvester == null) {
        memoryDelete.delete(i, true, 'outer_harvester');
        continue;
      }
      runHarvest(i);
    }
  }
}

function initRoom(roomIndex: number): void {
  let room = Memory.Outer[roomIndex];
  room.harvestersNum = 0;
  if (Game.rooms[room.roomName] == undefined) {
    return;
  }
  let sources = Game.rooms[room.roomName].find(FIND_SOURCES);
  for (let i = 0; i < sources.length; i++) {
    room.sources.push(sources[i].id);
  }
  room.isInit = true;
  return;
}

function newCreep(roomIndex: number): void {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let room = Memory.Outer[roomIndex];
  if (room.harvestersNum < room.sources.length) {
    Game.spawns['Spawn1'].memory.shouldSpawn = 'Outer_harvester';
    let newName: string = "Outer_harvester" + Game.time;
    let bodys = newCreepBody('harvester', Game.spawns.Spawn1.id);
    Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'Outer_harvester', roomName: room.roomName}});
    return;
  }
}

function runHarvest(roomIndex: number):void {
;
}