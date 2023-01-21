import { memoryAppend } from "@/MyMemory/MemoryAppend";
import { memoryDelete } from "@/MyMemory/MemoryDelete";
import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleCarrier } from "../Role/RoleCarrier";
import { tasks } from "./Tasks";

export const transferTask = {
  run: function(room: RoomMemory): void {
    newCarrier(room);

    let withdrawTask: {type: string, id: Id<AnyStoreStructure>, energy: number}[] = tasks.returnWithdraw(room);
    let transferTask: {type: string, id: Id<AnyStoreStructure>, energy: number}[] = tasks.returnTransfer(room);
    for (let i = 0; i < Memory.roles.carriers.length; ++i) {
      let carrier: Creep = Game.getObjectById(Memory.roles.carriers[i]);
      if (carrier == null) {
        memoryDelete.delete(i, true, 'carrier');
        continue;
      }
      let isTransfering = roleCarrier.isTransfering(carrier);
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