export const roleTransferer = {
  // 判断接收withdraw任务还是transfer任务
  isTransfering: function(creep: Creep): boolean {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }
    return creep.memory.transfering;
  },
  // 从storage获取能量
  goWithdraw: function(creep: Creep, room: RoomMemory): void {
    let storage = Game.getObjectById(room.storage);
    if (storage == null) {
      return;
    }
    if (storage.store[RESOURCE_ENERGY] == 0) {
      let links = room.links.map(i => Game.getObjectById(i)) as StructureLink[];
      let link = storage.pos.findInRange(links, 1)[0];
      if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.myMove(link);
      }
      return;
    }
    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.myMove(storage);
    }
    return;
  },
  // 运输能量
  goTransfer: function(creep: Creep, task: Id<AnyStoreStructure>): void {
    creep.memory.carrierTarget = task;
    let target: AnyStoreStructure = Game.getObjectById(task) as AnyStoreStructure;
    if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
      creep.memory.carrierTarget = null;
      return;
    }
    let res: number = 0;
    res = creep.transfer(target, RESOURCE_ENERGY);
    switch (res) {
      case OK: creep.memory.carrierTarget = null; break;
      case ERR_NOT_IN_RANGE: creep.myMove(target); break;
    }
    return;
  }
}