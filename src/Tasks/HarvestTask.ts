import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleHarvester } from "../Role/RoleHarvester";

export const harvestTask = {
  run: function(room: RoomMemory): void {
    newCreep(room);
    for (let i = 0; i < Memory.roles.harvesters.length; ++i) {
      roleHarvester.run(Game.getObjectById(Memory.roles.harvesters[i]), room);
    }
  }
}

function newCreep(room: RoomMemory): void {
  let harvesters = Memory.roles.harvesters;
  let transfers = Memory.roles.transfers;
  let sources = room.sources;
  Game.spawns['Spawn1'].memory.shouldSpawn = null;
  if (harvesters.length <= transfers.length && harvesters.length < sources.length) {
    Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
    newHarvester(harvesters, sources.length);
  }
}

function newHarvester(harvesters: Id<Creep>[], sourcesLength: number): void{
  let newName: string = "Harvester" + Game.time;
  let posFlag: number = 0;
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < harvesters.length; ++j) {
      if (i == Game.getObjectById(harvesters[j]).memory.sourcesPosition) {
        posFlag += 1;
        break;
      }
    }
    if (posFlag == i) break;
  }
  if (posFlag >= sourcesLength) return;

  Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'),
    newName, {memory:{role: 'harvester', sourcesPosition: posFlag}});
}