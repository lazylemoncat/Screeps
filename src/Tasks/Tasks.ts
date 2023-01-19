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

  returnTransfer: function(room: RoomMemory) {
    findTransferTask(room);
    let task: Id<Structure>[] = [];
    for (let key in tasks.transfer) {
      task = task.concat(tasks.transfer[key]);
    }
    return task;
  },

  returnWithdraw: function(room: RoomMemory) {
    findWithdraw(room);
    let task: Id<Structure>[] = [];
    for (let key in tasks.withdraw) {
      task = task.concat(tasks.withdraw[key]);
    }
    return task;
  },
}

function findWithdraw(room: RoomMemory) {
  linkTask('withdraw', room);
  containerTask('withdraw', room);
  storageTask('withdraw', room);
}

function findTransferTask(room: RoomMemory) {
  transferTask('spawn', room);
  transferTask('extension', room);
  transferTask('tower', room);
  transferTask('container', room);
  transferTask('storage', room);
}

function transferTask(type: string, room: RoomMemory) {
  let targets:Id<AnyStructure>[] = room.structures.filter(structure => 
    Game.getObjectById(structure).structureType == type &&
    (Game.getObjectById(structure) as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    for (let i = 0; i < targets.length; ++i) {
      if (!tasks.transfer[type].includes(targets[i]) && 
          Game.getObjectById(targets[i]).pos.findInRange(FIND_SOURCES, 2).length == 0) {
        tasks.transfer[type].push(targets[i]);
      }
    }
}

function linkTask(task: string, room: RoomMemory) {
  switch (task) {
    case 'withdraw': {
      let links: Id<StructureLink>[] = room.toLinks;
      for (let i = 0; i < room.toLinks.length; ++i){
        let link = Game.getObjectById(links[i]);
        if (link.store[RESOURCE_ENERGY] > 100 && !tasks.withdraw.link.includes(link.id)) {
          tasks.withdraw.link.push(link.id);
        }
      }
      break;
    }
  }
}

function containerTask(task: string, room: RoomMemory) {
  switch (task) {
    case 'withdraw': {
      let containers: Id<StructureContainer>[] = room.containers;
      for (let i = 0; i < containers.length; ++i) {
        if (Game.getObjectById(containers[i]).pos.findInRange(FIND_SOURCES, 1).length != 0) {
          let container = Game.getObjectById(containers[i]);
          if (container.store[RESOURCE_ENERGY] >= 50 && !tasks.withdraw.container.includes(container.id)) {
            tasks.withdraw.container.push(container.id);
          }
        }
      }
      break;
    }
  }
}

function storageTask(task: string, room: RoomMemory) {
  switch (task) {
    case 'withdraw': {
      let storage = Game.getObjectById(room.storage);
      if (storage != undefined && !tasks.withdraw.storage.includes(storage.id) &&
          storage.store[RESOURCE_ENERGY] >= 0) {
        tasks.withdraw.storage.push(storage.id);
      }
      break;
    }
  }
}