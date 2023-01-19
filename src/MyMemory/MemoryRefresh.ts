import { memoryDelete } from "./MemoryDelete"
import { memoryRoles } from "./MemoryRoles";
import { memoryRoom } from "./MemoryRoom";

export const memoryRefresh = {
  refresh: function() {
    memoryRoom.refresh();
    memoryDelete.deleteDead();
    memoryRoles.refresh();
  }
}