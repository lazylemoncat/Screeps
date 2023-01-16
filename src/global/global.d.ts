interface GlobalStructure {
  structures: AnyStructure[];
  sources: Source[];
  containers: StructureContainer[];
  links: StructureLink[];
  fromLinks: StructureLink[];
  toLinks: StructureLink[];
  refresh(): void;
}
interface MyGlobal {
  structures?: AnyStructure[];
  sources?: Source[];
  // harvester
  harvestPath?: PathStep;
  // repairer
  repairerTarget?: AnyStructure;
}