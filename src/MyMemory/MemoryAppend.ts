export const memoryAppend = {
  append: function(id: Id<Creep | Structure>, isCreep: boolean, role?: string) {
    if (isCreep) {
      let creepId = id as Id<Creep>;
      if (Memory.roles[role+'s'].includes(id)) {
        return;
      }
      switch (role) {
        case 'harvester': Memory.roles.harvesters.push(creepId); break
        case 'Outer_harvester': Memory.roles.outer_harvesters.push(creepId); break;
        case 'miner': Memory.roles.miners.push(creepId); break
        case 'carrier': Memory.roles.carriers.push(creepId); break;
        case 'builder': Memory.roles.builders.push(creepId); break
        case 'upgrader': Memory.roles.upgraders.push(creepId); break
        case 'repairer': Memory.roles.repairers.push(creepId); break
        case 'attacker': Memory.roles.attackers.push(creepId); break
      }
    }
  }
}