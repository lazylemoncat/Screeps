import { globalRole } from "../global/GlobalRole";

Creep.prototype.transferTo = function(fromCreep: Creep, toCreep?: Creep): number {
  if (toCreep == undefined) {
    if (!globalRole.transferTarget.includes(fromCreep.id)) {
      globalRole.transferTarget.push(fromCreep.id);
      return OK;
    }
    return -1;
  }
  let res = fromCreep.transfer(toCreep, RESOURCE_ENERGY);
  if (res == OK) {
    globalRole.transferTarget.splice(globalRole.transferTarget.indexOf(fromCreep.id), 1);
  }
  return res;
}