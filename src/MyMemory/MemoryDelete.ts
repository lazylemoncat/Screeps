export const memoryDelete = {
  // 删除死去的creep的memory
  deleteDead: function(): void {
    for(let name in Memory.creeps) {
      if(!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  },
  // 单独删除一个对象的memory
  delete: function(index: number, isCreep: boolean, role?: string): void {
    if (isCreep) {
        switch (role) {
          case 'harvester': Memory.roles.harvesters.splice(index, 1); break;
          case 'miner': Memory.roles.miners.splice(index, 1); break;
          case 'carrier': Memory.roles.carriers.splice(index, 1); break;
          case 'transferer': Memory.roles.carriers.splice(index, 1); break;
          case 'builder': Memory.roles.builders.splice(index, 1); break;
          case 'upgrader': Memory.roles.upgraders.splice(index, 1); break;
          case 'repairer': Memory.roles.repairers.splice(index, 1); break;
        }
    } else {
      ;
    }
  }
}
