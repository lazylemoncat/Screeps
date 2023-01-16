export const globalStructure: GlobalStructure = {
  sources: Object.values(Game.rooms)[0].find(FIND_SOURCES),
  structures: Object.values(Game.rooms)[0].find(FIND_STRUCTURES),
  containers: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_CONTAINER}),
  links: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_LINK}),
  fromLinks: creatLinks('from'),
  toLinks: creatLinks('to'),

  refresh: function() {
    globalStructure.structures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);
    globalStructure.containers = globalStructure.structures.filter(structure => 
      structure.structureType == STRUCTURE_CONTAINER) as StructureContainer[];
    globalStructure.links = globalStructure.structures.filter(structure => 
      structure.structureType == STRUCTURE_LINK) as StructureLink[];
    this.fromLinks = creatLinks('from');
    this.toLinks = creatLinks('to');
  }
}

function creatLinks(context: string): StructureLink[] {
  let from: StructureLink[] = [];
  let to: StructureLink[]= [];
  let links: StructureLink[] = Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_LINK});
  let sources = Object.values(Game.rooms)[0].find(FIND_SOURCES);
  for (let i = 0; i < links.length; ++i) {
    if (links[i].pos.findInRange(sources, 3)[0] != undefined) {
      from.push(links[i]);
    } else {
      to.push(links[i]);
    }
  }
  switch (context) {
    case 'from': return from;
    case 'to': return to;
  }
}