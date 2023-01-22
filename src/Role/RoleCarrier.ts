import { tasks } from "../Tasks/Tasks";

export const roleCarrier = {
  // 判断接收withdraw任务还是transfer任务
  isTransfering: function (creep: Creep): boolean {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }
    return creep.memory.transfering;
  },

  goTransfer: function (creep: Creep, task: Id<AnyStoreStructure>) {
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
  },

  goWithdraw: function(creep: Creep, task: Id<Creep | AnyStoreStructure>) {
    let target: Creep | AnyStoreStructure = Game.getObjectById(task);
    creep.memory.carrierTarget = task;
    if (target == null || target.store[RESOURCE_ENERGY] == 0) {
      creep.memory.carrierTarget = null;
      return;
    }
    let res: number = 0;
    if (target instanceof Creep) {
      res = target.transfer(creep, RESOURCE_ENERGY);
      target.memory.waiting = creep.id;
      switch (res) {
        case OK: creep.memory.carrierTarget = null; target.memory.waiting = null; break;
        case ERR_NOT_IN_RANGE: creep.myMove(target); break;
      }
    } else {
      res = creep.withdraw(target, RESOURCE_ENERGY);
      switch (res) {
        case OK: creep.memory.carrierTarget = null; break;
        case ERR_NOT_IN_RANGE: creep.myMove(target); break;
      }
    }  
    return;
  },
}