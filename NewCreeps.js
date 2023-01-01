let newCreeps = {
  run: function() {
    // delete dead creeps's memory
    deleteDead();
    // if harvesters less than sources*3, create it
    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    let sourcesLength = Game.spawns['Spawn1'].room.find(FIND_SOURCES).length;
    if (harvesters.length < sourcesLength * 3) {
      newHarvester(harvesters, sourcesLength);
      return;
    }
    // if upgrader less than 3, creat it
    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if (upgraders.length < 2) {
      newUpgrader();
      return;
    }
    // if builders less than 3, creat it
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < 3) {
      newBuilder();
      return;
    }
    // if transfers less than sources's length, creat it
    let transfers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
    if (transfers.length < sourcesLength) {
      newTransfer();
      return;
    }
    // if repairer less than 3, creat it
    let repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    if (repairer.length < 1) {
      newRepairer();
      return; 
    }
  }
}

module.exports = newCreeps;

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
  let flag = -1;
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
  for (let i = 0; i < sourcesLength; ++i) {
    for (let j = 0; j < harvesters.length; ++j) {
      if (harvesters[j].memory.sourcesPosition == i && ++sources[i] == 3) {
        flag = -1;
      } else {
        flag = i;
        continue;
      }
    }
    if (flag != -1) {
      posFlag = flag;
      if (posFlag == closestSource) {
        break;
      } else {
        continue
      }
    }
  }
  Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {
    memory: {role: 'harvester', sourcesPosition: posFlag}});
}

function newUpgrader() {
  let newName = 'Upgrader' + Game.time;
  Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
    memory: {role: 'upgrader'}});
}

function newBuilder() {
  let newName = 'Builder' + Game.time;
  Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, CARRY, MOVE], newName, {
    memory: {role: 'builder'}});
}

function newTransfer() {
  let newName = 'Transfer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, MOVE, MOVE, CARRY, MOVE], newName, {
    memory: {role: 'transfer'}});
}

function newRepairer() {
  let newName = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
    memory: {role: 'repairer'}});
}