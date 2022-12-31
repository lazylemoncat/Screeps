var roleHarvester = require('./RoleHarvester');
var roleUpgrader = require('./RoleUpgrader');
var roleBuilder = require('./RoleBuilder');
var roleTransfer = require('./RoleTransfer');
var roleRepairer = require('./RoleRepairer');
var tower = require('./Tower');
var newCreeps = require('./NewCreeps');

module.exports.loop = function () {

  // get room's controller level
  var level = Game.spawns["Spawn1"].room.controller.level
  // create new creeps
  newCreeps.run(level);

  for (let name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
        roleUpgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
        roleBuilder.run(creep);
    }
    if(creep.memory.role == 'transfer') {
      roleTransfer.run(creep);
    }
    if(creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
  }
  
  for (let name in Game.structures) {
    let structure = Game.structures[name];
    if (structure.structureType == STRUCTURE_TOWER) {
      tower.run(structure);
    }
  }
}