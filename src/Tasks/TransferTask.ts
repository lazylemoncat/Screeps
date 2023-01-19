import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleTransfer } from "../Role/RoleTransfer";
import { tasks } from "./Tasks";

export const transferTask = {
  run: function(room: RoomMemory) {
    newTransfer(room);

    let withdrawTask: Id<Creep | AnyStoreStructure>[] = tasks.returnWithdraw(room);
    let transferTask: Id<AnyStoreStructure>[] = tasks.returnTransfer(room);
    let transferIndex = 0;
    let withdrawIndex = 0;
    for (let i = 0; i < Memory.roles.transfers.length; ++i) {
      let transfer: Creep = Game.getObjectById(Memory.roles.transfers[i]);
      if (transfer.memory.carrierTarget != null) {
        if (roleTransfer.isTransfering(transfer)) {
          roleTransfer.goTransfer(transfer, transfer.memory.carrierTarget as Id<AnyStoreStructure>);
        } else {
          roleTransfer.goWithdraw(transfer, transfer.memory.carrierTarget)
        }
        continue;
      }
      if (roleTransfer.isTransfering(transfer)) {
        roleTransfer.goTransfer(transfer, transferTask[transferIndex++]);
      } else {
        roleTransfer.goWithdraw(transfer, withdrawTask[withdrawIndex++]);
      }
    }
  }
}

function newTransfer(room: RoomMemory): void{
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let harvesters = Memory.roles.harvesters;
  let transfers = Memory.roles.transfers;
  let sources = room.sources;
  let transferNum = room.links.length > 0 ? sources.length * 2 : sources.length;
  if (transfers.length >= harvesters.length && transfers.length >= transferNum) {
      return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';

  let newName: string = 'Transfer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer',}});
}