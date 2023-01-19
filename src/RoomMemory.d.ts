interface RoomMemory {
  sources: Id<Source>[],
  structures: Id<AnyStructure>[],
  spawns: Id<StructureSpawn>[],
  sites: Id<ConstructionSite>[],
  containers: Id<StructureContainer>[],
  storage: Id<StructureStorage>,
  links: Id<StructureLink>[],
  fromLinks: Id<StructureLink>[],
  toLinks: Id<StructureLink>[],
}