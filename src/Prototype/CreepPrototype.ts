Creep.prototype.myMove = function(target: AnyStructure|Creep|Source|ConstructionSite|Mineral) {
  // 初次寻找路线
  if (this.memory.path == null || this.memory.path.id != target.id) {
    let path = this.pos.findPathTo(target);
    if (target.pos.x != path[path.length - 1].x && target.pos.y != path[path.length - 1].y) {
      return;
    }
    this.memory.path = {path: Room.serializePath(path), id: target.id, lastPos: [this.pos.x, this.pos.y]};
    this.moveByPath(path);
  } else {
    let path = Room.deserializePath(this.memory.path.path);
    let res = this.moveByPath(path);
    if (res != OK || this.pos.x == this.memory.path.lastPos[0] && this.pos.y == this.memory.path.lastPos[1]) {
      let idx = path.findIndex(i => i.x == this.pos.x && i.y == this.pos.y);
      // 简单的对穿
      if(idx !== -1) {
        idx++;
        let pos = new RoomPosition(path[idx].x, path[idx].y, this.room.name);
        let target = pos.lookFor(LOOK_CREEPS)[0];
        let roles = ['carrier', 'transferer', 'upgrader'];
        if (target != undefined && roles.find(i => target.memory.role == i) != undefined) {
          this.move(this.pos.getDirectionTo(pos));
          target.move(target.pos.getDirectionTo(this));
          this.memory.path.lastPos = [this.pos.x, this.pos.y];
          return;
        }
      }
      // 重新寻找路线
      path = this.pos.findPathTo(target);
      this.memory.path.path = Room.serializePath(path);
      this.memory.path.id = target.id;
      this.moveByPath(path);
    }
    this.memory.path.lastPos = [this.pos.x, this.pos.y];
  }
  return;
}