export const globalStructure: GlobalStructure = {
  sources: Object.values(Game.rooms)[0].find(FIND_SOURCES),
  structures: Object.values(Game.rooms)[0].find(FIND_STRUCTURES),
  containers: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_CONTAINER}),
  links: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_LINK}),
  fromLinks: [],
  toLinks: [],
  refresh: function() {
    globalStructure.structures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);
    globalStructure.containers = globalStructure.structures.filter(structure => 
      structure.structureType == STRUCTURE_CONTAINER) as StructureContainer[];
    globalStructure.links = globalStructure.structures.filter(structure => 
      structure.structureType == STRUCTURE_LINK) as StructureLink[];
    this.fromLinks = [];
    this.toLinks = [];
    for (let i = 0; i < globalStructure.links.length; ++i) {
      if (this.links[i].pos.findInRange(this.sources, 3)[0] != undefined) {
        this.fromLinks.push(this.links[i]);
      } else {
        this.toLinks.push(this.links[i]);
      }
    }
  }
}