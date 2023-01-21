interface Memory {
  roles: {
    // Creep[]
    harvesters?: Id<Creep>[],
    carriers?: Id<Creep>[],
    upgraders?: Id<Creep>[],
    builders?: Id<Creep>[],
    repairers?: Id<Creep>[],
    claimers?: Id<Creep>[],
  },
}
interface CreepMemory {
  waiting?: Id<Creep>,
  role?: string,
  dying?: boolean,
  sourcesPosition?: Id<Source>,
  upgrading?: boolean,
  building?: boolean,
  transfering?: boolean,
  carrierTarget?: Id<Creep | AnyStoreStructure>,
  repairing?: boolean,
  repairtarget?: Id<AnyStructure>,
}
interface SpawnMemory {
  // next creep's role
  shouldSpawn?: string,
}