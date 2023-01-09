export const newCreepBody = function(role) {
  // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
  let capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
  if (Object.getOwnPropertyNames(Memory.creeps).length < 8 || capacity == 300) {
    switch (role) {
      case 'harvester' : return [WORK, CARRY, MOVE, MOVE];
      case 'upgrader' : return [WORK, CARRY, MOVE, MOVE];
      case 'builder' : return [WORK, CARRY, MOVE, MOVE];
      case 'transfer' : return [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
      case 'repairer' : return [WORK, CARRY, MOVE, MOVE];
    }
  } else {
    switch (role) {
      case 'harvester' : {
        let bodys = [];
        capacity /= 50;
        bodys.push(CARRY, WORK, MOVE);
        capacity -= 4;
        for (; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, WORK, MOVE);
        }
        return bodys;
      }
      case 'upgrader' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 4; capacity -= 4) {
          bodys.push(WORK, CARRY, MOVE);
        }
        return bodys;
      }
      case 'builder' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 4; capacity -= 4) {
          bodys.push(WORK, CARRY, MOVE);
        }
        return bodys;
      }
      case 'transfer' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 3; capacity -= 3) {
          bodys.push(MOVE, CARRY, CARRY);
        }
        return bodys;
      }
      case 'repairer' : {
        let bodys = [];
        for (capacity /= 50; capacity >= 5; capacity -= 5) {
          bodys.push(WORK, CARRY, MOVE, MOVE);
        }
        return bodys;
      }
      case 'attacker' : {
        let bodys = [];
        bodys.push(ATTACK, MOVE);
        capacity -= 130;
        for (capacity /= 60; capacity >= 1; capacity -= 1){
          bodys.push(TOUGH, MOVE);
        }
        return bodys;
      }
    }
  }
}