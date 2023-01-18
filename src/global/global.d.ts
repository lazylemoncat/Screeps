interface GlobalStructure {
  structures: AnyStructure[];
  sources: Source[];
  sites: ConstructionSite[];
  containers: StructureContainer[];
  links: StructureLink[];
  fromLinks: StructureLink[];
  toLinks: StructureLink[];
  refresh(): void;
}