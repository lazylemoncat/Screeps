interface Memory {
  roles: {
    // Creep[]
    harvesters?: Id<Creep>[],
    transfers?: Id<Creep>[],
    upgraders?: Id<Creep>[],
    builders?: Id<Creep>[],
    repaiers?: Id<Creep>[],
    claimers?: Id<Creep>[],
  },
}
interface CreepMemory {
  waiting?: Id<Creep>,
  role?: string,
  dying?: boolean,
  sourcesPosition?: any,
  upgrading?: boolean,
  building?: boolean,
  transfering?: boolean,
  carrierTarget?: Id<Creep | AnyStoreStructure>,
  repairing?: boolean,
}
interface SpawnMemory {
  // next creep's role
  shouldSpawn?: string,
}