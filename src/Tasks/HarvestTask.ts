import { globalStructure } from "../global/GlobalStructure";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleHarvester } from "../Role/RoleHarvester";
import { roleTransfer } from "../Role/RoleTransfer";

export const harvestTask = {
  run: function(): void {
    newCreep();

    for (let i = 0; i < Memory.roles.harvesters.length; ++i) {
      roleHarvester.run(Game.getObjectById(Memory.roles.harvesters[i]));
    }
    for (let i = 0; i < Memory.roles.transfers.length; ++i) {
      roleTransfer.run(Game.getObjectById(Memory.roles.transfers[i]));
    }
  }
}

function newCreep(): void {
  let harvesters = Memory.roles.harvesters;
  let transfers = Memory.roles.transfers;
  let sources = globalStructure.sources;
  Game.spawns['Spawn1'].memory.shouldSpawn = null;
  if (harvesters.length <= transfers.length && harvesters.length < sources.length) {
    Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
    newHarvester(harvesters);
  } else if (harvesters.length > transfers.length && transfers.length < sources.length) {
    Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';
    newTransfer(transfers);
  }
}

function newHarvester(harvesters: Id<Creep>[]): void{
  let newName: string = "Harvester" + Game.time;
  let sourcesLength: number = globalStructure.sources.length;
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

function newTransfer(transfers: Id<Creep>[]): void{
  let newName: string = 'Transfer' + Game.time;
  let sourcesLength: number = globalStructure.sources.length;
  let posFlag: number = 0;
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < transfers.length; ++j) {
      if (Game.getObjectById(transfers[j]).memory.sourcesPosition == i) {
        posFlag += 1;
        break;
      }
    }
    if (posFlag == i) break;
  }
  if (posFlag >= sourcesLength) return;

  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer', sourcesPosition: posFlag,}});
}