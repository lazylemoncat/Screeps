'use strict';

const roleHarvester = {
  run: function(creep) {
    // if harvester's free capacity more than 0, harvest energy
    if (backRoom$3(creep) == 0) {
      return;
    }
    if(creep.store.getFreeCapacity() > 0) {
      goHarvest(creep);
    } else {
      transferEnergy(creep);
    }
	}
};

function backRoom$3(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}

function goHarvest(creep) {
  let targetSource = creep.room.find(FIND_SOURCES)[creep.memory.sourcesPosition];
  if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetSource);
  }
}

function transferEnergy(creep) {
  let transferTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE ||
    structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN ||
    structure.structureType == STRUCTURE_TOWER)
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if(creep.transfer(transferTo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(transferTo);
  }
}

const roleBuilder = {
  run: function (creep) {
    if (backRoom$2(creep) == 0) {
      return;
    }
    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    } else if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if(creep.memory.building) {
      goBuild(creep);
    } else {
      goGetEnergy$2(creep);
    }
	}
};

function backRoom$2(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}

function goBuild(creep) {
  let target = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(target[0]) {
      if(creep.build(target[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
}

function goGetEnergy$2(creep) {
  let targetStore = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0}});

  if (targetStore != null) {
    if (creep.withdraw(targetStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetStore);
    }
    return;
  } else {
    let soureces = creep.room.find(FIND_SOURCES, {filter :
      (sources) => sources.energy > 0});
    if (creep.harvest(soureces[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(soureces[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return;
  }
}

const roleUpgrader = {
  run: function(creep) {
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
      isNearToTarget(creep);
      goUpgrade(creep);
    } else {
      goGetEnergy$1(creep);
    }
	}
};

function goUpgrade(creep) {
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

function goGetEnergy$1(creep) {
  let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter :
    (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE) &&
    structure.store[RESOURCE_ENERGY] > 0});
  
  if (target == undefined) {
    target = creep.pos.findClosestByPath(FIND_SOURCES,{filter :
      (sources) => sources.energy > 0});
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
  } else if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}

function isNearToTarget(creep) {
  let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
  if (creep.pos.isNearTo(closestSource)) {
    creep.moveTo(creep.room.controller);
  }
}

const roleAttacker = {
  run : function (creep) {
    // let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
    // if (enemy[0] == undefined) {
    //   return;
    // } else {
    //   goAttack(creep, enemy);
    // }
    if(creep.pos.roomName != creep.memory.room) {
      let pos = Game.flags.Flag1.pos;
      if (creep.moveTo(pos) == ERR_NO_PATH) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES);
        creep.attack(target);
      }
      /* creep.moveTo(Game.getObjectById('63b529848d21f8ad5fe698c6').pos);
      creep.attack(Game.getObjectById('63b529848d21f8ad5fe698c6')); */
      return;
  }
    let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemy[0] == undefined) {
      enemy = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter:
        (structure) => structure.structureType == STRUCTURE_TOWER});
      if (enemy[0] == undefined) {
        return;
      }
      goAttack$1(creep, enemy);
    } else {
      goAttack$1(creep, enemy);
    }
  }
};

function goAttack$1(creep, enemy) {
  let target = creep.pos.findClosestByPath(enemy);
  if (creep.attack(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}

const roleHealer = {
  run : function(creep) {
    let injured = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter :
      (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creep.room});
    if (injured == undefined) {
      let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
      if (enemy[0] == undefined) {
        return;
      } else {
        let attacker = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter :
          (creeps) => creeps.memory.role == 'attacker'});
        creep.moveTo(attacker);
      }
    } else {
      if (creep.heal(injured) == ERR_NOT_IN_RANGE) {
        creep.moveTo(injured);
      }
    }
  }
  
};

const roleRepairer = {
  run: function(creep) {
    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
    } else if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      goRepair(creep);
      backRoom$1(creep);
    } else {
      goGetEnergy(creep);
    }
  }
};

function backRoom$1(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
  }
}

function goRepair(creep) {
  let targetTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax &&
    object.structureType != STRUCTURE_WALL});
  if (creep.repair(targetTo) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetTo);
  }
}

function goGetEnergy(creep) {
  let targetEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, 
    {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER ||
    structure.structureType == STRUCTURE_STORAGE)
    && structure.store[RESOURCE_ENERGY] > 0}});
  if (targetEnergy == null) {
    targetEnergy = creep.pos.findClosestByPath(FIND_SOURCES);
    if(creep.harvest(targetEnergy) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetEnergy);
    }
  } else {
    if (creep.withdraw(targetEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetEnergy);
      }
  }
}

const roleTransfer = {
  run: function(creep) {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }

    if (backRoom(creep) == 0) {
      return;
    }
    if (creep.memory.transfering) {
      goTransfer(creep);
    } else {
      goWithdraw(creep);
    }
  }
};

function backRoom(creep) {
  if (creep.room != Game.spawns["Spawn1"].room) {
    creep.moveTo(Game.spawns["Spawn1"]);
    return 0;
  } else {
    return -1;
  }
}


function goTransfer(creep) {
  let target = creep.room.find(FIND_STRUCTURES, {filter : 
    (structure) => {return (structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});
  if (target[0] != undefined) {
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = creep.room.find(FIND_STRUCTURES, {
    filter : (structure) => {return (structure.structureType == STRUCTURE_TOWER) &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});
  if (target[0] != undefined) {
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target[0]);
    }
    return;
  }

  target = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {return (
    (structure.structureType == STRUCTURE_CONTAINER && 
    structure.pos.isNearTo(structure.pos.findClosestByPath(FIND_SOURCES)) == false) ||
    structure.structureType == STRUCTURE_STORAGE)
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }
  });
  if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target[0]);
  }
}

function goWithdraw(creep) {
  let targetSource = Game.getObjectById(creep.memory.sources);
  let targetContainer = targetSource.pos.findClosestByPath(FIND_STRUCTURES, {filter:
    (structure) => (structure.structureType == STRUCTURE_CONTAINER)});
  if (targetContainer == null || targetContainer.store[RESOURCE_ENERGY] == 0) {
    targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter:
      (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
      structure.structureType == STRUCTURE_STORAGE)&&
      structure.store[RESOURCE_ENERGY] > 0
    });
  }
  if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetContainer);
  }
}

const structureTower = {
  run: function (tower) {
    let enemy = tower.room.find(FIND_HOSTILE_CREEPS);
    let injured = tower.room.find(FIND_MY_CREEPS, {filter :
      (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creep.room});
    if (enemy[0] != undefined) {
      goAttack(tower, enemy);
    } else if (injured[0] != undefined) {
      tower.heal(injured[0]);
    } else {
      runRepair(tower);
    }
  }
};

function goAttack(tower, enemy) {
  let target = tower.pos.findClosestByPath(enemy);
  tower.attack(target);
}

function runRepair (tower) {
  let targetTo = tower.room.find(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax &&
    object.structureType != STRUCTURE_WALL});
  tower.repair(targetTo[0]);
}

const newCreepBody = function(role) {
  // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
  let capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
  if (Object.getOwnPropertyNames(Memory.creeps).length < 8 || capacity == 300) {
    switch (role) {
      case 'harvester' : return [WORK, CARRY, MOVE, MOVE];
      case 'upgrader' : return [WORK, CARRY, MOVE, MOVE];
      case 'builder' : return [WORK, CARRY, MOVE, MOVE];
      case 'transfer' : return [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
      case 'repairer' : return [WORK, CARRY, MOVE, MOVE];
    }
  } else {
    switch (role) {
      case 'harvester' : {
        let bodys = [];
        capacity /= 50;
        bodys.push(CARRY, WORK, MOVE);
        capacity -= 4;
        for (; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, WORK, MOVE);
        }
        return bodys;
      }
      case 'upgrader' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 4; capacity -= 4) {
          bodys.push(WORK, CARRY, MOVE);
        }
        return bodys;
      }
      case 'builder' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 4; capacity -= 4) {
          bodys.push(WORK, CARRY, MOVE);
        }
        return bodys;
      }
      case 'transfer' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 3; capacity -= 3) {
          bodys.push(MOVE, CARRY, CARRY);
        }
        return bodys;
      }
      case 'repairer' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, CARRY, MOVE, MOVE);
        }
        return bodys;
      }
      case 'attacker' : {
        let bodys = [];
        bodys.push(ATTACK, MOVE);
        capacity -= 130;
        for (capacity /= 60; capacity >= 1; capacity -= 1){
          bodys.push(TOUGH, MOVE);
        }
        return bodys;
      }
    }
  }
};

const newCreeps = {
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
};

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

const loop = function () {
  // create new creeps
  if (newCreeps.run() == -1) ;
  // run creeps
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'transfer') {
      roleTransfer.run(creep);
    }
    if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
    if (creep.memory.role == 'attacker') {
      roleAttacker.run(creep);
    }
    if (creep.memory.role == 'healer') {
      roleHealer.run(creep);
    }
  }
  // run structures
  for (let name in Game.structures) {
    let structure = Game.structures[name];
    if (structure.structureType == STRUCTURE_TOWER) {
      structureTower.run(structure);
    }
  }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
