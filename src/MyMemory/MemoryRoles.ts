// 在memory中储存各个角色的Id
export const memoryRoles = {
  refresh: function(): void {
    let roles = returnIds();
    Memory.roles = {
      // Id<Creep>[]
      harvesters: roles.harvester,
      carriers: roles.carrier,
      transferers: roles.transferer,
      upgraders: roles.upgrader,
      builders: roles.builder,
      repairers: roles.repairer,
      claimers: roles.claimer,
    }
  }
}

function returnIds(): {
  harvester: Id<Creep>[],
  carrier: Id<Creep>[],
  transferer: Id<Creep>[],
  upgrader: Id<Creep>[],
  builder: Id<Creep>[],
  repairer: Id<Creep>[],
  claimer: Id<Creep>[],
} {
  let roles = {
    harvester: [],
    carrier: [],
    transferer: [],
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