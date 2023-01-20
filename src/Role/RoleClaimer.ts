export const roleClaimer = {
  run: function(creep: Creep, room: string): void {
    let flag = Game.flags[creep.pos.createFlag('claim')];
    flag.setPosition(new RoomPosition(1, 1, room));
    if (creep.pos.roomName != flag.room.name) {
      creep.moveTo(flag.pos.x, flag.pos.y);
      return;
    }
    if(creep.room.controller) {
      if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
  }
}