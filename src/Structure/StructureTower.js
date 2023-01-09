export const structureTower = {
  run: function (tower) {
    let enemy = tower.room.find(FIND_HOSTILE_CREEPS);
    let injured = tower.room.find(FIND_MY_CREEPS, {filter :
      (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creep.room});
    if (enemy[0] != undefined) {
      goAttack(tower, enemy);
    } else if (injured[0] != undefined) {
      tower.heal(injured[0]);
    } else {
      runRepair(tower);
    }
  }
};

function goAttack(tower, enemy) {
  let target = tower.pos.findClosestByPath(enemy);
  tower.attack(target);
}

function runRepair (tower) {
  let targetTo = tower.room.find(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax &&
    object.structureType != STRUCTURE_WALL});
  tower.repair(targetTo[0]);
}