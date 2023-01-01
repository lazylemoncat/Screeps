let roleAttacker = {
  run : function (creep) {
    let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemy[0] == undefined) {
      return;
    } else {
      goAttack(creep, enemy);
    }
  }
}

module.exports = roleAttacker;

function goAttack(creep, enemy) {
  let target = creep.pos.findClosestByPath(enemy);
  if (creep.attack(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }
}