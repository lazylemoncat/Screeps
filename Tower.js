let tower = {
  run: function (tower) {
    let enemy = tower.room.find(FIND_HOSTILE_CREEPS);
    if (enemy[0] != undefined) {
      goAttack(tower, enemy);
    }
    runRepair(tower);
  }
};

module.exports = tower;

function goAttack(tower, enemy) {
  let target = tower.pos.findClosestByPath(enemy);
  tower.attack(target);
}

function runRepair (tower) {
  let targetTo = tower.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax});
  tower.repair(targetTo);
}