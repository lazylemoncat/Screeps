export const roleAttacker = {
  run : function (creep) {
    // let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
    // if (enemy[0] == undefined) {
    //   return;
    // } else {
    //   goAttack(creep, enemy);
    // }
    if(creep.pos.roomName != creep.memory.room) {
      let pos = Game.flags.Flag1.pos;
      if (creep.moveTo(pos) == ERR_NO_PATH) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES);
        creep.attack(target);
      }
      /* creep.moveTo(Game.getObjectById('63b529848d21f8ad5fe698c6').pos);
      creep.attack(Game.getObjectById('63b529848d21f8ad5fe698c6')); */
      return;
  }
    let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemy[0] == undefined) {
      enemy = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter:
        (structure) => structure.structureType == STRUCTURE_TOWER});
      if (enemy[0] == undefined) {
        return;
      }
      goAttack(creep, enemy);
    } else {
      goAttack(creep, enemy);
    }
  }
}

function goAttack(creep, enemy) {
  let target = creep.pos.findClosestByPath(enemy);
  if (creep.attack(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}