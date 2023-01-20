export const memoryRoles = {
  refresh: function(): void {
    let roles = returnIds();
    Memory.roles = {
      // Id<Creep>[]
      harvesters: roles.harvester,
      transfers: roles.transfer,
      upgraders: roles.upgrader,
      builders: roles.builder,
      repaiers: roles.repairer,
    }
  }
}

function returnIds() {
  let roles = {
    harvester: [],
    transfer: [],
    upgrader: [],
    builder: [],
    repairer: [],
    claimer: [],
  }
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role != undefined) {
      roles[creep.memory.role].push(creep.id);
    }
  }
  return roles;
}