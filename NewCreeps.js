var myFind = require('./MyFind');

var newCreeps = {
  run: function(level) {

    // delete dead creeps
    for(var name in Memory.creeps) {
      if(!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
  }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var transfers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
    var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

    // if harvesters less than sources, create it
    var sourcesLength = Game.spawns['Spawn1'].room.find(FIND_SOURCES).length;
    if (harvesters.length < sourcesLength) {
      if (harvesters.length == 0) {
        var newName = 'Harvester' + Game.time;
        var flag1 = 0;
        for (var i = 0; i < sourcesLength; ++i) {
          if (Game.spawns['Spawn1'].room.find(FIND_SOURCES)[i] == 
            myFind.spawnFind("closestSource", "Spawn1")) {
            flag1 = i;
            break;
          }
        }
        ;
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {
          memory: {role: 'harvester', sourcesPosition: flag1}});
      } else {
        var flag = -1;
        var newName = 'Harvester' + Game.time;
        for (var i = 0; i < sourcesLength; ++i) {
          var j = 0;
          for (j = 0; j < harvesters.length; ++j) {
            if (harvesters[j].memory.sourcesPosition == i) {
              flag = -1;
              break;
            } else {
              flag = i;
              continue;
            }
          }
          if (flag != -1) {
            break;
          }
        }
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {
          memory: {role: 'harvester', sourcesPosition: flag}});
      }
    }
    // if upgrader less than 3, creat it
    else if (upgraders.length < 2) {
      var newName = 'Upgrader' + Game.time;
      Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
        memory: {role: 'upgrader'}});
    }
    // if builders less than 3, creat it
    else if (builders.length < 3) {
      var newName = 'Builder' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, CARRY, MOVE], newName, {
          memory: {role: 'builder'}});
    }
    // if transfers less than 3, creat it
    else if (transfers.length < sourcesLength) {
      var newName = 'Transfer' + Game.time;
      Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
        memory: {role: 'transfer'}});
    }
    // if repairer less than 3, creat it
    else if (repairer.length < 2) {
      var newName = 'Repairer' + Game.time;
      Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
        memory: {role: 'repairer'}});
    }
  }
}

module.exports = newCreeps;