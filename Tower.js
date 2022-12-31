var tower = {
  runRepair : function(tower) {
    var targetTo = tower.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax});
    tower.repair(targetTo);
  },
  run : function (tower) {
    this.runRepair(tower);
  }
};

module.exports = tower;