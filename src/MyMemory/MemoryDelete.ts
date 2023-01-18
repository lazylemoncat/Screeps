export const memoryDelete = {
  deleteDead: function() {
    // delete dead creeps
    for(let name in Memory.creeps) {
      if(!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }
}
