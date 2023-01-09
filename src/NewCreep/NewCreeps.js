import { newCreepBody } from "./NewCreepBodys";

export const newCreeps = {
  run: function() {
    // delete dead creeps's memory
    deleteDead();
    // if harvesters less than sources*1, create it
    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    let sourcesLength = Game.spawns['Spawn1'].room.find(FIND_SOURCES).length;

    if (harvesters.length < sourcesLength * 2) {
      newHarvester(harvesters, sourcesLength);
      return;
    }
    // if builders less than 1, creat it
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < 1) {
      newBuilder();
      return;
    }
    // if upgrader less than 1, creat it
    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if (upgraders.length < 3) {
      newUpgrader();
      return;
    }
    // if transfers less than sources's length, creat it
    let transfers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
    if (transfers.length < sourcesLength) {
      newTransfer(transfers, sourcesLength);
      return;
    }
    // if repairer less than 1, creat it
    let repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    if (repairer.length < 1) {
      newRepairer();
      return; 
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

function newHarvester(harvesters, sourcesLength) {
  let newName = 'Harvester' + Game.time;
  let closestSource = Game.spawns["Spawn1"].pos.findClosestByPath(FIND_SOURCES);
  let sources = [];
  for (let i = 0; i < sourcesLength; ++i) {
    sources[i] = 0;
  }
  for (let i = 0; i < sourcesLength; ++i) {
    if (closestSource == Game.spawns["Spawn1"].room.find(FIND_SOURCES)[i]) {
      closestSource = i;
      break;
    }
  }
  let posFlag = closestSource;
  for (let i = 0; i < harvesters.length; ++i) {
    ++sources[harvesters[i].memory.sourcesPosition];
  }
  if (sources[posFlag] >= 2) {
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i] < 2) {
        posFlag = i;
        break;
      }
    }
  }
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'), newName, {
    memory: {role: 'harvester', sourcesPosition: posFlag}});
}

function newUpgrader() {
  let newName = 'Upgrader' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('upgrader'), newName, {
    memory: {role: 'upgrader'}});
}

function newBuilder() {
  let newName = 'Builder' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
    memory: {role: 'builder'}});
}

function newTransfer(transfer, sourcesLength) {
  let newName = 'Transfer' + Game.time;
  let posFlag = 0;
  let closestSource = Game.spawns["Spawn1"].pos.findClosestByPath(FIND_SOURCES);
  if (transfer.length == 0) {
    for (let i = 0; i < sourcesLength; ++i) {
      if (closestSource == Game.spawns["Spawn1"].room.find(FIND_SOURCES)[i]) {
        closestSource = i;
        break;
      }
    }
    posFlag = closestSource;
  } else {
    for (let i = 0; i < sourcesLength; ++i) {
      for (let j = 0; j < transfer.length; ++j) {
        if (transfer[j].memory.sourcesPosition != i) {
          posFlag = i;
          break;
        }
      }
    }
  }
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer', 
    sources: Game.spawns["Spawn1"].room.find(FIND_SOURCES)[posFlag].id
    }});
}

function newRepairer() {
  let newName = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}