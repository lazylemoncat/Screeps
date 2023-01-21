export const roleRepairer = {
  run: function(creep: Creep, room: RoomMemory): void {
    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
      global.repairerTarget = null;
    } else if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      goRepair(creep, room);
    } else {
      goGetEnergy(creep, room);
    }
  }
}

function goRepair(creep: Creep, room: RoomMemory): void {
  // 根据repairer的内存直接找到对象
  let repairTarget = Game.getObjectById(creep.memory.repairtarget);
  if (repairTarget != null && repairTarget.hits < repairTarget.hitsMax) {
    if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
      creep.moveTo(repairTarget);
    }
    return;
  }
  let injured: AnyStructure[] = creep.room.find(FIND_STRUCTURES).filter(object => 
    object.hits < object.hitsMax);
  let targetTo: AnyStructure[] = [];
  // 若有tower,则专心修墙
  if (room.towers.length == 0){
    targetTo = injured.filter(structure => structure.structureType != STRUCTURE_WALL);
  } else {
    targetTo = injured.sort((a,b) => a.hits - b.hits);
  }
  creep.memory.repairtarget = targetTo[0].id;
  if (creep.repair(targetTo[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(targetTo[0]);
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
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0]);
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