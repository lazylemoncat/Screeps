interface CreepMemory {
  role?: string,
  dying?: boolean,
  sourcesPosition?: any,
  upgrading?: boolean,
  building?: boolean,
  transfering?: boolean,
  transferTarget?: Id<Creep>,
  repairing?: boolean,
}
interface SpawnMemory {
  shouldSpawn?: string,
}
