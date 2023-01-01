let roleHarvester = require('./RoleHarvester');
let roleUpgrader = require('./RoleUpgrader');
let roleBuilder = require('./RoleBuilder');
let roleTransfer = require('./RoleTransfer');
let roleRepairer = require('./RoleRepairer');
let roleAttacker = require('./RoleAttacker');
let roleHealer = require('./RoleHealer');
let tower = require('./Tower');
let newCreeps = require('./NewCreeps');

module.exports.loop = function () {

  // get room's controller level
  // var level = Game.spawns["Spawn1"].room.controller.level
  // create new creeps
  newCreeps.run();

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
  
  for (let name in Game.structures) {
    let structure = Game.structures[name];
    if (structure.structureType == STRUCTURE_TOWER) {
      tower.run(structure);
    }
  }
}