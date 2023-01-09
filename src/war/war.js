import { newCreepBody } from "../NewCreep/NewCreepBodys";

export const war = {
  run : function(room) {
    let attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
    if (attackers < 3) {
      let newName = 'Attacker' + Game.time;
      Game.spawns['Spawn1'].spawnCreep(newCreepBody('attacker'), newName, {memory: {
        role: 'attacker',
        room: room
        }});
    }
  }
}