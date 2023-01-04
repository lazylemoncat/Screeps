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
    if (upgraders.length < 1) {
      newUpgrader();
      return;
    }
    // if builders less than 3, creat it
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < 1) {
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

function newCreepBody(role) {
  // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
  let capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
  if (capacity == 300) {
    switch (role) {
      case 'harvester' : return [WORK, CARRY, MOVE, MOVE];
      case 'upgrader' : return [WORK, CARRY, MOVE, MOVE];
      case 'builder' : return [WORK, CARRY, MOVE, MOVE];
      case 'transfer' : return [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
      case 'repairer' : return [WORK, CARRY, MOVE, MOVE];
    }
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
  console.log(harvesters);
  for (let i = 0; i < harvesters.length; ++i) {
    ++sources[harvesters[i].memory.sourcesPosition];
    console.log(harvesters[i].memory.sourcesPosition);
  }
  if (sources[posFlag] >= 3) {
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i] < 3) {
        posFlag = i;
        break;
      }
    }
  }
  console.log("posFlag = " + posFlag);
  console.log(sources);
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

function newTransfer() {
  let newName = 'Transfer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {
    memory: {role: 'transfer'}});
}

function newRepairer() {
  let newName = 'Repairer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
    memory: {role: 'repairer'}});
}