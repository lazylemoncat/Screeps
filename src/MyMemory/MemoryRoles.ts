// 在memory中储存各个角色的Id
export const memoryRoles = {
  refresh: function(): void {
    let roles = returnIds();
    Memory.roles = {
      // Id<Creep>[]
      harvesters: roles.harvester,
      outer_harvesters: roles.outer_harvester,
      miners: roles.miner,
      carriers: roles.carrier,
      transferers: roles.transferer,
      upgraders: roles.upgrader,
      builders: roles.builder,
      repairers: roles.repairer,
      claimers: roles.claimer,
      attackers: roles.attacker,
    }
  }
}

function returnIds(): {
  harvester: Id<Creep>[],
  outer_harvester: Id<Creep>[],
  miner: Id<Creep>[],
  carrier: Id<Creep>[],
  transferer: Id<Creep>[],
  upgrader: Id<Creep>[],
  builder: Id<Creep>[],
  repairer: Id<Creep>[],
  claimer: Id<Creep>[],
  attacker: Id<Creep>[],
} {
  let roles = {
    harvester: [],
    outer_harvester: [],
    miner: [],
    carrier: [],
    transferer: [],
    upgrader: [],
    builder: [],
    repairer: [],
    claimer: [],
    attacker: [],
  }
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role != undefined) {
      roles[creep.memory.role].push(creep.id);
    }
  }
  return roles;
}