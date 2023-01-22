import { tasks } from "../Tasks/Tasks";

export const roleHarvester = {
  run: function(creep: Creep, room: RoomMemory): void {
    let transfered: boolean = false;
    // 避免采集过多能量掉在地上造成浪费
    if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK) * 2) {
      transfered = transferEnergy(creep, room);
    }
    goHarvest(creep, transfered, room);
	}
};

function goHarvest(creep: Creep, transfered: boolean, room: RoomMemory): void {
  let source: Source = Game.getObjectById(creep.memory.sourcesPosition);
  if (!creep.pos.isNearTo(source)) {
    creep.myMove(source);
    return;
  }
  if (source.energy == 0 || 
      creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
    return;
  }

  let containers = room.containers.map(i => Game.getObjectById(i));
  let container = creep.pos.findInRange(containers, 1)[0];
  if (container != undefined) {
    if (!creep.pos.isEqualTo(container)) {
      creep.myMove(container);
    }
  }
  creep.harvest(source);
  return;
}

function transferEnergy(creep: Creep, room: RoomMemory): boolean {
  if (Game.getObjectById(creep.memory.waiting) != null) {
    return;
  }
  let links: Id<StructureLink>[] = room.links;
  let containers = room.containers.map(i => Game.getObjectById(i));
  let sources: Id<Source>[] = room.sources;
  // 若creep身边无link,container则发布一个withdraw任务让carrier拿走能量
  if (links.length == 0 && containers.length < sources.length &&
      creep.pos.findInRange(containers, 1).length == 0) {
    let obj = {type: 'creep', id: creep.id, energy: creep.store[RESOURCE_ENERGY]};
    if (!tasks.withdraw.find(i => i.id == creep.id)) {
      tasks.withdraw.push(obj);
    }
    return false;
  }
  if (!transfer(creep, room)) {
    return false;
  }
  return true;
}

function transfer(creep: Creep, room: RoomMemory): boolean {
  // 优先将能量送往link,若身边有link,则不再将能量送进container中
  let links = room.links.map(i => Game.getObjectById(i));
  let link: StructureLink = creep.pos.findInRange(links, 1)[0];
  if (link != undefined) {
    if (creep.transfer(link, RESOURCE_ENERGY) == OK) {
      return true;
    }
    return false;
  }
  let containers = room.containers.map(i => Game.getObjectById(i));
  let container = creep.pos.findInRange(containers, 1)[0];
  if (container != undefined) {
    if (creep.transfer(container, RESOURCE_ENERGY) == OK) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}