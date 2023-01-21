export const roleBuilder = {
  run: function (creep: Creep, room: RoomMemory): void {
    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    } else if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if(creep.memory.building) {
      goBuild(creep, room);
    } else {
      goGetEnergy(creep, room);
    }
	}
};

function goBuild(creep: Creep, room: RoomMemory): void {
  let sites: Id<ConstructionSite>[] = room.sites;
  let target: ConstructionSite = Game.getObjectById(sites[0]);
  if(target) {
    if(creep.build(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
  return;
}

function goGetEnergy(creep: Creep, room: RoomMemory): void {
  let creepNeed = creep.store.getFreeCapacity(RESOURCE_ENERGY);
  // 优先从storage，container中拿取能量，若能量不足或无建筑则从source中采集
  if (creep.memory.carrierTarget == null) {
    let targetStore: AnyStoreStructure = null;
    if (room.storage != undefined && 
        Game.getObjectById(room.storage).store[RESOURCE_ENERGY] >= creepNeed) {
      targetStore = Game.getObjectById(room.storage);
    } else if (room.containers[0] != undefined) {
      let containers = room.containers.map(i => Game.getObjectById(i));
      targetStore = creep.pos.findClosestByRange(containers, {filter: store =>
        store.store[RESOURCE_ENERGY] >= creepNeed});
    }
    if (targetStore == null) {
      let sources: Source = Game.getObjectById(room.sources[0]);
      if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources);
      }
      return;
    }
    // 将对象存储入creep内存中
    creep.memory.carrierTarget = targetStore.id;
  }

  let target = Game.getObjectById(creep.memory.carrierTarget) as AnyStoreStructure;
  if (target == null || target.store[RESOURCE_ENERGY] < creepNeed) {
    creep.memory.carrierTarget = null;
    return;
  }
  let res = creep.withdraw(target, RESOURCE_ENERGY);
  switch (res) {
    case ERR_NOT_IN_RANGE: creep.moveTo(target); break;
    case OK: creep.memory.carrierTarget = null; break;
  }
  return;
}