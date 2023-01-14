export const roleClaimer = {
  run: function(creep: Creep): void {
    let pos = new RoomPosition(1,1,'W59S26');
    if (creep.pos.roomName != pos.roomName) {
      creep.moveTo(pos.x, pos.y);
      return;
    }
    if(creep.room.controller) {
      if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller);
      }
    }
  }
}