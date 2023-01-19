import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { roleTransfer } from "../Role/RoleTransfer";
import { tasks } from "./Tasks";

export const transferTask = {
  run: function(room: RoomMemory) {
    newTransfer(room);

    let withdrawTask: Id<Creep | Structure>[] = tasks.returnWithdraw(room);
    let transferTask: Id<Structure>[] = tasks.returnTransfer(room);
    let transferIndex = 0;
    let withdrawIndex = 0;
    for (let i = 0; i < Memory.roles.transfers.length; ++i) {
      let transfer: Creep = Game.getObjectById(Memory.roles.transfers[i]);
      if (transfer.memory.carrierTarget != null) {
        if (roleTransfer.isTransfering(transfer)) {
          roleTransfer.goTransfer(transfer, transfer.memory.carrierTarget as Id<Structure>);
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
  if (transfers.length >= harvesters.length || transfers.length >= sources.length) {
      return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';

  let newName: string = 'Transfer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer',}});
}