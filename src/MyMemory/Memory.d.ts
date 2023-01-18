interface Memory {
  roles: {
    harvesters?: Id<Creep>[],
    transfers?: Id<Creep>[],
    upgraders?: Id<Creep>[],
    builders?: Id<Creep>[],
    repaiers?: Id<Creep>[],
  }
}