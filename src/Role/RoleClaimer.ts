export const roleClaimer = {
  run: function(creep: Creep, flagName: string): void {
    let flag = Game.flags[flagName];
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