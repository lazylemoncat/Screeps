import { tasks } from "../Tasks/Tasks";

export const roleTransfer = {
  isTransfering: function (creep: Creep): boolean {
    if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.transfering = false;
    }
    if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
      creep.memory.transfering = true;
    }
    return creep.memory.transfering;
  },

  goTransfer: function (creep: Creep, task: Id<Structure>) {
    creep.memory.carrierTarget = task;
    let target: AnyStoreStructure = Game.getObjectById(task) as AnyStoreStructure;
    if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
      for (let key in tasks.transfer) {
        if (tasks.transfer[key].includes(task)) {
          tasks.transfer[key].splice(tasks.transfer[key].indexOf(task), 1);
          break;
        }
      }
      creep.memory.carrierTarget = null;
      return;
    }
    let type = target.structureType;
    let res: number = 0;
    res = creep.transfer(target, RESOURCE_ENERGY);
    switch (res) {
      case OK: creep.memory.carrierTarget = null; break;
      case ERR_NOT_IN_RANGE: creep.moveTo(target, {reusePath: 1}); break;
    }
    tasks.transfer[type].splice(tasks.transfer[type].indexOf(task), 1);
    return;
  },

  goWithdraw: function(creep: Creep, task: Id<Creep | Structure>) {
    let target: Creep | Structure = Game.getObjectById(task);
    creep.memory.carrierTarget = task;
    if (target == null) {
      for (let key in tasks.withdraw) {
        if (tasks.withdraw[key].includes(target)) {
          tasks.withdraw[key].splice(tasks.withdraw[key].indexOf(task), 1);
          break;
        }
      }
      creep.memory.carrierTarget = null;
      return;
    }
    let res: number = 0;
    if (target instanceof Creep) {
      res = target.transfer(creep, RESOURCE_ENERGY);
      target.memory.waiting = creep.id;
      switch (res) {
        case OK: creep.memory.carrierTarget = null; target.memory.waiting = null; break;
        case ERR_NOT_IN_RANGE: creep.moveTo(target, {reusePath: 1}); break;
      }
      tasks.withdraw.creep.splice(tasks.withdraw.creep.indexOf(task), 1);
    } else {
      let type = target.structureType;
      res = creep.withdraw(target, RESOURCE_ENERGY);
      switch (res) {
        case OK: creep.memory.carrierTarget = null; break;
        case ERR_NOT_IN_RANGE: creep.moveTo(target, {reusePath: 1}); break;
      }
      tasks.withdraw[type].splice(tasks.withdraw[type].indexOf(task), 1);
    }  
    return;
  },
}