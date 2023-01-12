import { newCreepBody } from "./NewCreepBodys";

export const newCreeps = {
  run: function(): number {
    // delete dead creeps's memory
    deleteDead();
    if (Game.spawns.Spawn1.room.energyAvailable < 200) {
      return 0;
    }
    // if harvesters less than sources*2, create it
    let harvesters: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    let sourcesLength: number = Game.spawns['Spawn1'].room.find(FIND_SOURCES).length;
    if (harvesters.length < sourcesLength * 2) {
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
    if (upgraders.length < 1) {
      newUpgrader();
      return 0;
    }
    // if transfers less than sources's length, creat it
    let transfers: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
    if (transfers.length < sourcesLength) {
      newTransfer(transfers, sourcesLength);
      return 0;
    }
    // if repairer less than 1, creat it
    let repairer: Creep[] = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    if (repairer.length < 1) {
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
  let closestSource: Source = Game.spawns["Spawn1"].pos.findClosestByPath(FIND_SOURCES);
  let sources: number[] = [];
  let posFlag = 0;
  for (let i = 0; i < sourcesLength; ++i) {
    sources[i] = 0;
  }
  for (let i = 0; i < sourcesLength; ++i) {
    if (closestSource == Game.spawns["Spawn1"].room.find(FIND_SOURCES)[i]) {
      posFlag = i;
      break;
    }
  }
  for (let i = 0; i < harvesters.length; ++i) {
    for (let j = 0; j < sourcesLength; ++j) {
      if (Game.spawns.Spawn1.room.find(FIND_SOURCES)[j].id == harvesters[i].memory.sourcesPosition) {
        ++sources[j];
      }
    }
  }
  if (sources[posFlag] >= 2) {
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i] < 2) {
        posFlag = i;
        break;
      }
    }
  }
  let source: Source[] = Game.spawns.Spawn1.room.find(FIND_SOURCES);
  let sourcesPosition: String = source[posFlag].id;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'), newName, {
    memory: {role: 'harvester', sourcesPosition: sourcesPosition}});
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
  let source: Source[] = Game.spawns.Spawn1.room.find(FIND_SOURCES);
  let sources: number[] = [];
  for (let i = 0; i < sourcesLength; ++i) {
    sources[i] = 0;
  }
  for (let i = 0; i < transfer.length; ++i) {
    for (let j = 0; j < sourcesLength; ++j) {
      if (transfer[i].memory.sourcesPosition == source[j].id) {
        ++sources[j];
      }
    }
  }
  for (let i = 0; i < sourcesLength; ++i) {
    if (sources[i] == 0) {
      posFlag = i;
      break;
    }
  }
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer', 
    sourcesPosition: Game.spawns["Spawn1"].room.find(FIND_SOURCES)[posFlag].id,
    }});
}

function newRepairer() {
  let newName: string = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}