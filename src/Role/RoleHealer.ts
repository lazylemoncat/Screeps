export const roleHealer = {
  run : function(creep) {
    let injured = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter :
      (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creep.room});
    if (injured == undefined) {
      let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
      if (enemy[0] == undefined) {
        return;
      } else {
        let attacker = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter :
          (creeps) => creeps.memory.role == 'attacker'});
        creep.moveTo(attacker);
      }
    } else {
      if (creep.heal(injured) == ERR_NOT_IN_RANGE) {
        creep.moveTo(injured);
      }
    }
  }
  
}