export const upgradeFlag = {
  find: function(name: string, roomMemory: RoomMemory): string {
    let room = Game.getObjectById(roomMemory.controller).room;
    let flags = room.find(FIND_FLAGS);
    for (let i = 0; i < flags.length; ++i) {
      switch (flags[i].name) {
        case 'slowlyUpgrade': return 'slowlyUpgrade';
        default: continue;
      }
    }
    return null;
  }
}