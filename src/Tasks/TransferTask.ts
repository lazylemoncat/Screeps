import { newCreepBody } from "../NewCreep/NewCreepBodys";
import { globalStructure } from "../global/GlobalStructure";
import { roleTransfer } from "../Role/RoleTransfer";
import { tasks } from "./Tasks";

export const transferTask = {
  run: function() {
    newTransfer();

    let withdrawTask: Id<Creep | Structure>[] = tasks.returnWithdraw();
    let transferTask: Id<Structure>[] = findTransferTask();
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

function newTransfer(): void{
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  let harvesters = Memory.roles.harvesters;
  let transfers = Memory.roles.transfers;
  let sources = globalStructure.sources;
  if (transfers.length >= harvesters.length || transfers.length >= sources.length) {
      return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';

  let newName: string = 'Transfer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, {memory: {
    role: 'transfer',}});
}

function findTransferTask(): Id<Structure>[] {
  spawnTransfer();
  extensionTransfer();
  towerTransfer();
  containerTransfer();
  storageTransfer();
  return tasks.returnTransfer();
}

function spawnTransfer() {
  
}

function extensionTransfer() {

}

function towerTransfer() {

}
function containerTransfer() {

}

function storageTransfer() {

}