export const tasks = {
  withdraw: [],
  transfer: [],

  returnTransfer: function(room: RoomMemory) {
    findTransferTask(room);
    const structureType = ['spawn', 'extension', 'tower', 'container', 'storage',];
    tasks.transfer.sort(function (a,b) {
      let typea = structureType.indexOf(a.type);
      let typeb = structureType.indexOf(b.type);
      return typea - typeb;
    });
    return tasks.transfer;
  },

  returnWithdraw: function(room: RoomMemory) {
    findWithdraw(room);
    const type = ['creep', 'link', 'container', 'storage',];
    tasks.withdraw.sort(function (a,b) {
      let typea = type.indexOf(a.type);
      let typeb = type.indexOf(b.type);
      return typea - typeb;
    });
    return tasks.withdraw;
  },
}

function findWithdraw(room: RoomMemory): void {
  withdrawTask('link', room);
  withdrawTask('container', room);
  withdrawTask('storage', room);
  return;
}

function findTransferTask(room: RoomMemory): void {
  transferTask('spawn', room);
  transferTask('extension', room);
  transferTask('tower', room);
  transferTask('container', room);
  transferTask('storage', room);
  return;
}

function transferTask(type: string, room: RoomMemory): void {
  let obj: {type?: string, id?: Id<AnyStoreStructure>, energy?: number} = {};
  let targets:Id<AnyStoreStructure>[] = (room.structures as Id<AnyStoreStructure>[]).filter(structure => 
    Game.getObjectById(structure).structureType == type &&
    Game.getObjectById(structure).store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  for (let i = 0; i < targets.length; ++i) {
    let energy = Game.getObjectById(targets[i]).store.getFreeCapacity(RESOURCE_ENERGY);
    obj = {type: type, id: targets[i], energy: energy};
    if (!tasks.transfer.some(i => i.id == obj.id) && 
        Game.getObjectById(targets[i]).pos.findInRange(FIND_SOURCES, 2).length == 0) {
      tasks.transfer.push(obj);
    }
  }
  return;
}

function withdrawTask(type: string, room: RoomMemory): void {
  let obj: {type?: string, id?: Id<AnyStoreStructure>, energy?: number} = {};
  switch (type) {
    case 'link': {
      let links: Id<StructureLink>[] = room.toLinks;
      for (let i = 0; i < links.length; ++i){
        let link = Game.getObjectById(links[i]);
        let energy = link.store[RESOURCE_ENERGY];
        obj = {type: 'link', id: link.id, energy: energy};
        if (energy > 100 && !tasks.withdraw.find(i => i.id == obj.id)) {
          tasks.withdraw.push(obj);
        }
      }
      break;
    }
    case 'container': {
      let containers: Id<StructureContainer>[] = room.containers;
      for (let i = 0; i < containers.length; ++i) {
        if (Game.getObjectById(containers[i]).pos.findInRange(FIND_SOURCES, 1).length != 0) {
          let container = Game.getObjectById(containers[i]);
          let energy = container.store[RESOURCE_ENERGY];
          obj = {type: 'container', id: container.id, energy: energy};
          if (energy >= 50 && !tasks.withdraw.find(i => i.id == obj.id)) {
            tasks.withdraw.push(obj);
          }
        }
      }
      break;
    }
    case 'storage': {
      let storage = Game.getObjectById(room.storage);
      if (storage != undefined) {
        let energy = storage.store[RESOURCE_ENERGY];
        obj = {type: 'storage', id: storage.id, energy: energy};
        if (!tasks.withdraw.find(i => i.id == obj.id) && energy >= 50) {
          tasks.withdraw.push(obj);
        }
      }
      break;
    }
  }
  return;
}