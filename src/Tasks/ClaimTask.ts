import { newCreepBody } from "@/NewCreep/NewCreepBodys";
import { roleClaimer } from "@/Role/RoleClaimer";
import { buildTask } from "./BuildTask";

export const claimTask = {
  run: function(room: string) {
    if (Game.rooms[room].find(FIND_STRUCTURES).filter(structure =>
          structure.structureType == STRUCTURE_SPAWN).length > 0) {
      Game.flags.claim.remove();
      return;
    }
    if (Game.flags.claim == undefined) {
      let pos = new RoomPosition(1, 1, room);
      Game.flags.claim.setPosition(Game.rooms[pos.roomName].controller.pos);
    }
    if (Game.flags.claim.room.controller.owner.username == null) {
      newClaimer();
      for (let i = 0; i < Memory.roles.claimers.length; ++i) {
        roleClaimer.run(Game.getObjectById(Memory.roles.claimers[i]), 'claim');
      }
    } else if (Game.flags.claim.room.controller.owner.username == 'LazyKitty') {
      buildTask.run(Memory.rooms[Game.flags.claim.room.name]);
    }
  }
}

function newClaimer() {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  if (Memory.roles.claimers.length > 0) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'claimer';
  let newName = 'claimer' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('claimer'), 
    newName, {memory:{role: 'harvester'}});
}