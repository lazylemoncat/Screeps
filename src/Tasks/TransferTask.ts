import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { roleTransferer } from "@/Role/RoleTransferer";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleCarrier } from "../Role/RoleCarrier";
import { tasks } from "./Tasks";

export const transferTask = {
  run: function(room: RoomMemory): void {
    newCarrier(room);
    newTransferer(room);

    let withdrawTask: {type: string, id: Id<AnyStoreStructure>, energy: number}[] = tasks.returnWithdraw(room);
    let transferTask: {type: string, id: Id<AnyStoreStructure>, energy: number}[] = tasks.returnTransfer(room);
    for (let i = 0; i < Memory.roles.transferers.length; ++i) {
      let transferer = Game.getObjectById(Memory.roles.transferers[i]);
      if (transferer == null) {
        memoryDelete.delete(i, true, 'transferer');
        continue;
      }
      let isTransfering: boolean = roleTransferer.isTransfering(transferer);
      if (isTransfering) {
        if (transferTask[0] == undefined || transferTask[0].id == room.storage) {
          continue;
        }
        if (transferer.memory.carrierTarget != null) {
          roleTransferer.goTransfer(transferer, transferer.memory.carrierTarget as Id<AnyStoreStructure>);
          continue;
        }
        roleTransferer.goTransfer(transferer, transferTask[0].id);
        transferTask[0].energy -= transferer.store[RESOURCE_ENERGY];
        if (transferTask[0].energy <= 0) {
          transferTask.shift();
        }
      } else {
        roleTransferer.goWithdraw(transferer, room);
      }
    }
    for (let i = 0; i < Memory.roles.carriers.length; ++i) {
      let carrier: Creep = Game.getObjectById(Memory.roles.carriers[i]);
      if (carrier == null) {
        memoryDelete.delete(i, true, 'carrier');
        continue;
      }
      let isTransfering: boolean = roleCarrier.isTransfering(carrier);
      if (carrier.memory.carrierTarget != null) {
        if (isTransfering) {
          roleCarrier.goTransfer(carrier, carrier.memory.carrierTarget as Id<AnyStoreStructure>);
        } else {
          roleCarrier.goWithdraw(carrier, carrier.memory.carrierTarget)
        }
        continue;
      }
      if (isTransfering) {
        if (transferTask[0] == undefined) {
          continue;
        }
        roleCarrier.goTransfer(carrier, transferTask[0].id);
        transferTask[0].energy -= carrier.store[RESOURCE_ENERGY];
        if (transferTask[0].energy <= 0) {
          transferTask.shift();
        }
      } else {
        if (withdrawTask[0] == undefined) {
          continue;
        }
        roleCarrier.goWithdraw(carrier, withdrawTask[0].id);
        withdrawTask[0].energy -= carrier.store.getFreeCapacity(RESOURCE_ENERGY);
        if (withdrawTask[0].energy <= 0) {
          withdrawTask.shift();
        }
      }
    }
    return;
  }
}

function newCarrier(room: RoomMemory): void{
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let harvesters = Memory.roles.harvesters;
  let carriers = Memory.roles.carriers;
  let sources = room.sources;
  if (carriers.length >= harvesters.length && carriers.length >= sources.length) {
      return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'carrier';

  let newName: string = 'Carrier' + Game.time;
  let bodys = newCreepBody('carrier', room.spawns[0]);
  if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'carrier',}}) == OK) {
    ;
  }
  return;
}

function newTransferer(room: RoomMemory) {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  if (Game.getObjectById(room.storage) == null || Memory.roles.transferers.length > 0) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'transferer';

  let newName: string = 'Transferer' + Game.time;
  let bodys = newCreepBody('carrier', room.spawns[0]);
  Game.spawns['Spawn1'].spawnCreep(bodys, newName, {memory: {role: 'transferer',}});
  return
}