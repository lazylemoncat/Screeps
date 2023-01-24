export const roleAttacker = {
  run: function(creep: Creep, room: string): void {
    if (Game.flags.war == undefined) {
      let flag = Game.flags[creep.pos.createFlag('war')];
      flag.setPosition(new RoomPosition(25, 25, room));
      flag.remove();
    }
    let flag =Game.flags.war;
    if (creep.pos.roomName != room) {
      creep.moveTo(flag.pos.x, flag.pos.y);
      return;
    }
    let tower = creep.room.find(FIND_HOSTILE_STRUCTURES).filter(i => i.structureType == STRUCTURE_TOWER)[0];
    if (tower != undefined && creep.pos.getRangeTo(tower) != 1) {
      creep.moveTo(tower);
      creep.attack(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)[0]);
    }
    return;
  }
}