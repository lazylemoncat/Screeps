export const memoryRoom = {
  refresh: function() {
    for(let name in Game.rooms) {
      let structures = Game.rooms[name].find(FIND_STRUCTURES);
      Memory.rooms[name] = {
        // Id<Source>[]
        sources: Game.rooms[name].find(FIND_SOURCES).map(source => source.id),
        // Id<AnyStructure>[]
        structures: structures.map(structure => structure.id) as Id<AnyStructure>[],
        // Id<StructureSpawn>[]
        spawns: structures.filter(structure => structure.structureType == STRUCTURE_SPAWN).
          map(structure => structure.id) as Id<StructureSpawn>[],
        // Id<ConstructionSite>[]
        sites: Game.rooms[name].find(FIND_CONSTRUCTION_SITES).map(site => site.id),
        // Id<StructureContainer>[]
        containers: structures.filter(structure => structure.structureType == STRUCTURE_CONTAINER).
          map(structure => structure.id) as Id<StructureContainer>[],
        // Id<StructureStorage>
        storage: Game.rooms[name].storage.id,
        // StructureLink[]
        links: structures.filter(structure => structure.structureType == STRUCTURE_LINK).
          map(structure => structure.id) as Id<StructureLink>[],
        // harvested energy fromLink~toLink
        fromLinks: creatLinks('from'),
        toLinks: creatLinks('to'),
      };
    }
  }
}

function creatLinks(context: string): Id<StructureLink>[] {
  let from: Id<StructureLink>[] = [];
  let to: Id<StructureLink>[]= [];
  let links: StructureLink[] = Object.values(Game.rooms)[0].find(FIND_STRUCTURES, {filter: structure =>
    structure.structureType == STRUCTURE_LINK});
  let sources = Object.values(Game.rooms)[0].find(FIND_SOURCES);
  for (let i = 0; i < links.length; ++i) {
    if (links[i].pos.findInRange(sources, 3)[0] != undefined) {
      from.push(links[i].id);
    } else {
      to.push(links[i].id);
    }
  }
  switch (context) {
    case 'from': return from;
    case 'to': return to;
  }
  return [];
}