interface RoomMemory {
  sources: Id<Source>[],
  mineral: Id<Mineral>,
  controller: Id<StructureController>,
  structures: Id<AnyStructure>[],
  spawns: Id<StructureSpawn>[],
  sites: Id<ConstructionSite>[],
  containers: Id<StructureContainer>[],
  towers: Id<StructureTower>[],
  storage: Id<StructureStorage>,
  links: Id<StructureLink>[],
  fromLinks: Id<StructureLink>[],
  toLinks: Id<StructureLink>[],
}