export const structureTower = {
  run: function (tower: StructureTower): void {
    let enemy: Creep[] = tower.room.find(FIND_HOSTILE_CREEPS);
    let injured: Creep[] = tower.room.find(FIND_MY_CREEPS, {filter :
      (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creeps.room});
    if (enemy[0] != undefined) {
      goAttack(tower, enemy);
    } else if (injured[0] != undefined) {
      tower.heal(injured[0]);
    } else {
      runRepair(tower);
    }
  }
};

function goAttack(tower: StructureTower, enemy: Creep[]): void {
  let target: Creep = tower.pos.findClosestByRange(enemy);
  tower.attack(target);
}

function runRepair (tower: StructureTower): void {
  let targetTo: AnyStructure[] = tower.room.find(FIND_STRUCTURES, {
    filter: object => object.hits < object.hitsMax &&
    object.structureType != STRUCTURE_WALL});
  tower.repair(targetTo[0]);
}