Creep.prototype.myMove = function(target: AnyStructure|Creep|Source|ConstructionSite|Mineral) {
  if (this.memory.path == null || this.memory.path.id != target.id) {
    let path = this.pos.findPathTo(target);
    if (target.pos.x != path[path.length - 1].x && target.pos.y != path[path.length - 1].y) {
      return;
    }
    this.memory.path = {path: Room.serializePath(path), id: target.id, lastPos: [this.pos.x, this.pos.y]};
    this.moveByPath(path);
  } else {
    let res = this.moveByPath(Room.deserializePath(this.memory.path.path));
    if (res != OK || this.pos.x == this.memory.path.lastPos[0] &&
        this.pos.y == this.memory.path.lastPos[1]) {
      let path = this.pos.findPathTo(target);
      this.memory.path.path = Room.serializePath(path);
      this.memory.path.id = target.id;
      this.moveByPath(path);
    }
    this.memory.path.lastPos = [this.pos.x, this.pos.y];
  }
  return;
}