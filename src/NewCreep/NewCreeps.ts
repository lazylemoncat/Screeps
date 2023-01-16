import { globalStructure } from "@/global/GlobalStructure";
import { newCreepBody } from "./NewCreepBodys";

export const newCreeps = {
  /**
   * 
   * @returns { number } 0 | -1
   * @author LazyKitty
   */
  run: function(): number {
    // delete dead creeps's memory
    deleteDead();
    if (Game.spawns.Spawn1.room.energyAvailable < 200) {
      return 0;
    }
    // if harvesters less than sources, create it
    let harvesters: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    let sourcesLength: number = globalStructure.sources.length;
    if (harvesters.length < sourcesLength) {
      newHarvester(harvesters, sourcesLength);
      return 0;
    }
    // if builders less than 1 and sites exist, creat it
    let builders: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    let sites: ConstructionSite[] = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length != 0 && builders.length < 1) {
      newBuilder();
      return 0;
    }
    // if upgrader less than 1, creat it
    let upgraders: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    let upgradersNum: number = sites.length > 0 || globalStructure.links.length > 0 ? 1 : 2;
    if (upgraders.length < upgradersNum) {
      newUpgrader();
      return 0;
    }
    // if transfers less than sources's length * 2, creat it
    // if link exist, transfer's number equal sources's length
    let transfers: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
    let transferNum: number = globalStructure.links[0] != undefined ? sourcesLength: sourcesLength * 2;
    if (globalStructure.containers.length > 1 && transfers.length < transferNum) {
      newTransfer(transfers, sourcesLength);
      return 0;
    }
    // if repairer less than 1, creat it
    let repairer: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    if (globalStructure.containers.length > 1 && repairer.length < 1) {
      newRepairer();
      return 0; 
    }
    return -1;
  }
}

function deleteDead () {
  // delete dead creeps
  for(let name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

function newHarvester(harvesters: Creep[], sourcesLength: number) {
  let newName: string = 'Harvester' + Game.time;
  let posFlag = 0;
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < harvesters.length; ++j) {
      if (i == harvesters[j].memory.sourcesPosition) {
        posFlag += 1;
        break;
      }
    }
    if (posFlag == i) break;
  }
  if (posFlag >= sourcesLength) return;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'), newName, {
    memory: {role: 'harvester', sourcesPosition: posFlag}});
}

function newUpgrader() {
  let newName: string = 'Upgrader' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('upgrader'), newName, {
    memory: {role: 'upgrader'}});
}

function newBuilder() {
  let newName: string = 'Builder' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
    memory: {role: 'builder'}});
}

function newTransfer(transfer: Creep[], sourcesLength: number) {
  let newName: string = 'Transfer' + Game.time;
  let posFlag: number = 0;
  let temp: number = 0;
  let transferNum = globalStructure.links[0] == undefined ? 1: 2;
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < transfer.length; ++j) {
      if (transfer[j].memory.sourcesPosition == i) {
        temp += 1;
        if (temp == transferNum) {
          posFlag += 1;
          temp = 0;
          break;
        }
      }
    }
    if (posFlag == i) break;
  }
  if (posFlag >= sourcesLength) return;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer', 
    sourcesPosition: posFlag,
  }});
}

function newRepairer() {
  let newName: string = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}