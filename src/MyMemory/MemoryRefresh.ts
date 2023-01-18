import { memoryDelete } from "./MemoryDelete"
import { memoryRoles } from "./MemoryRoles";

export const memoryRefresh = {
  refresh: function() {
    memoryDelete.deleteDead();
    memoryRoles.refresh();
  }
}