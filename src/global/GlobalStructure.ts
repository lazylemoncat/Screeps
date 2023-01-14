// get Source[]
global.sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
// get Container[]
global.containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {filter:
  structure => structure.structureType == STRUCTURE_CONTAINER
});