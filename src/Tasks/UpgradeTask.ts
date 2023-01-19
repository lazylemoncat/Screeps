import { roleUpgrader } from "../Role/RoleUpgrader";
import { newCreepBody } from "../NewCreep/NewCreepBodys";

export const upgradeTask = {
  run: function(room: RoomMemory) {
    let upgraders = Memory.roles.upgraders;
    let upgradersNum = room.sites.length > 0 ? 1 : 3;
    if (Memory.roles.upgraders.length < upgradersNum) {
      newUpgrader();
    }
    for (let i = 0; i < upgraders.length; ++i) {
      roleUpgrader.run(Game.getObjectById(upgraders[i]), room);
    }
  }
}

function newUpgrader() {
  if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
    return;
  }
  Game.spawns['Spawn1'].memory.shouldSpawn = 'upgrader';
  let newName: string = 'Upgrader' + Game.time;
  Game.spawns['Spawn1'].spawnCreep(newCreepBody('upgrader'), newName, {
    memory: {role: 'upgrader'}});
}