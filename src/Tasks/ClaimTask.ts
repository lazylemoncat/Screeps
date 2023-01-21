import { newCreepBody } from "@/NewCreep/NewCreepBodys";
// import { roleClaimer } from "@/Role/RoleClaimer";

export const claimTask = {
  run: function(roomName: string, room: RoomMemory) {
    if (Game.rooms[roomName] != undefined && Game.rooms[roomName].controller.owner.username == 'LazyKitty') {
      return;
    }
    newClaimer(room);
    for (let i = 0; i < Memory.roles.claimers.length; ++i) {
      // roleClaimer.run(Game.getObjectById(Memory.roles.claimers[i]), room);
    }
  }
}

function newClaimer(room: RoomMemory) {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  if (Memory.roles.claimers.length > 0) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'claimer';
  let newName = 'claimer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('claimer', room.spawns[0]), 
    newName, {memory:{role: 'claimer'}});
}