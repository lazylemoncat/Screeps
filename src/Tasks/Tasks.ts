import { globalStructure } from "@/global/GlobalStructure";

export const tasks = {
  withdraw: {
    creep: [],
    link: [],
    container: [],
    storage: [],
  },
  transfer: {
    spawn: [],
    extension: [],
    tower: [],
    container: [],
    storage: [],
  },

  returnTransfer: function() {
    findTransferTask();
    let task: Id<Structure>[] = [];
    for (let key in tasks.transfer) {
      task = task.concat(tasks.transfer[key]);
    }
    return task;
  },

  returnWithdraw: function() {
    findWithdraw();
    let task: Id<Structure>[] = [];
    for (let key in tasks.withdraw) {
      task = task.concat(tasks.withdraw[key]);
    }
    return task;
  },
}

function findWithdraw() {
  linkTask('withdraw');
  containerTask('withdraw');
  storageTask('withdraw');
}

function findTransferTask() {
  transferTask('spawn');
  transferTask('extension');
  transferTask('tower');
  transferTask('container');
  transferTask('storage');
}

function transferTask(type: string) {
  let targets:AnyStoreStructure[] = (globalStructure.structures as AnyStoreStructure[]).filter(structure =>
    structure.structureType == type &&
    Game.getObjectById(structure.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    for (let i = 0; i < targets.length; ++i) {
      if (!tasks.transfer[type].includes(targets[i].id) && 
          targets[i].pos.findInRange(globalStructure.sources, 2).length == 0) {
        tasks.transfer[type].push(targets[i].id);
      }
    }
}

function linkTask(task: string) {
  switch (task) {
    case 'withdraw': {
      let links: StructureLink[] = globalStructure.toLinks;
      for (let i = 0; i < globalStructure.toLinks.length; ++i){
        let link = Game.getObjectById(links[i].id);
        if (link.store[RESOURCE_ENERGY] > 100 && !tasks.withdraw.link.includes(link.id)) {
          tasks.withdraw.link.push(link.id);
        }
      }
      break;
    }
  }
}

function containerTask(task: string) {
  switch (task) {
    case 'withdraw': {
      let containers = globalStructure.containers;
      for (let i = 0; i < containers.length; ++i) {
        if (containers[i].pos.findInRange(globalStructure.sources, 1).length != 0) {
          let container = Game.getObjectById(containers[i].id);
          if (container.store[RESOURCE_ENERGY] >= 50 && !tasks.withdraw.container.includes(container.id)) {
            tasks.withdraw.container.push(container.id);
          }
        }
      }
      break;
    }
  }
}

function storageTask(task: string) {
  switch (task) {
    case 'withdraw': {
      let storage = Object.values(Game.rooms)[0].storage;
      if (storage != undefined && !tasks.withdraw.storage.includes(storage.id) &&
          storage.store[RESOURCE_ENERGY] >= 0) {
        tasks.withdraw.storage.push(storage.id);
      }
      break;
    }
  }
}