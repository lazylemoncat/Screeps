// 返回孵化creep需要的部件数组
export const newCreepBody = function(role: String, spawn: Id<StructureSpawn>): BodyPartConstant[] {
  // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
  let capacity: number = Game.getObjectById(spawn).room.energyCapacityAvailable;
  if (capacity == 300 || Game.getObjectById(spawn).room.find(FIND_CREEPS).length < 4 ) {
    switch (role) {
      case 'harvester' : return [WORK, CARRY, MOVE];
      case 'upgrader' : return [WORK, CARRY, MOVE];
      case 'builder' : return [WORK, CARRY, MOVE, MOVE];
      case 'carrier' : return [CARRY, MOVE];
      case 'repairer' : return [WORK, CARRY, MOVE, MOVE];
    }
  } else {
    switch (role) {
      case 'harvester': {
        let bodys: BodyPartConstant[] = [CARRY, MOVE];
        capacity /= 50;
        capacity -= 2;
        for (; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, WORK, MOVE);
          if (bodys.length >= 8) {
            if (capacity >= 2) {
              bodys.push(WORK);
            }
            break;
          }
        }
        return bodys;
      }
      case 'upgrader': {
        let bodys: BodyPartConstant[] = [];
        capacity /= 50;
        bodys.push(WORK, CARRY, MOVE);
        capacity -= 4;
        for (; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, WORK, MOVE);
          if (bodys.length == 9) break;
        }
        return bodys;
      }
      case 'builder': {
        let bodys: BodyPartConstant[] = [];
        for (capacity /= 50; capacity >= 4; capacity -= 4) {
          bodys.push(WORK, CARRY, MOVE);
          if (bodys.length == 12) break;
        }
        return bodys;
      }
      case 'carrier': {
        let bodys: BodyPartConstant[] = [];
        for (capacity /= 50; capacity >= 2; capacity -= 2) {
          bodys.push(MOVE, CARRY);
          if (bodys.length == 20) break;
        }
        return bodys;
      }
      case 'repairer': {
        let bodys: BodyPartConstant[] = [];
        for (capacity /= 50; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, CARRY, MOVE, MOVE);
          if (bodys.length == 12) break;
        }
        return bodys;
      }
      case 'claimer': {
        if (capacity >= 650) {
          return [CLAIM, MOVE];
        } else {
          return [];
        }
      }
    }
  }
  return [];
}