import { globalStructure } from "./GlobalStructure";

export const globalAutoSites = {
  run: function() {
    creatContainerSites();
  }
}

function creatContainerSites() {
  for (let i = 0; i < globalStructure.sources.length; ++i) {
    let containers = globalStructure.sources[i].pos.findInRange(globalStructure.containers, 1);
    if (containers[0] != undefined) {
      continue;
    } else {
      let sites = globalStructure.sources[i].pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
      if (sites[0] != undefined) {
        continue;
      }
    }
    let path: PathStep[] = Game.spawns.Spawn1.pos.findPathTo(globalStructure.sources[i], {ignoreCreeps: true});
    let posX = path[path.length - 2].x;
    let posY = path[path.length - 2].y;
    let pos = new RoomPosition(posX, posY, Game.spawns.Spawn1.room.name);
    pos.createConstructionSite(STRUCTURE_CONTAINER);
  }
  let contronller: StructureController = Object.values(Game.rooms)[0].controller;
  let containers = contronller.pos.findInRange(globalStructure.containers, 1);
  let sites: ConstructionSite[] = contronller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2);
  if (containers[0] == undefined && sites[0] == undefined) {
    let path: PathStep[] = Game.spawns.Spawn1.pos.findPathTo(contronller);
    let posX = path[path.length - 3].x;
    let posY = path[path.length - 3].y;
    let pos = new RoomPosition(posX, posY, Game.spawns.Spawn1.room.name);
    pos.createConstructionSite(STRUCTURE_CONTAINER);
  }
}