import { memoryDelete } from "./MemoryDelete"
import { memoryRoles } from "./MemoryRoles";
import { memoryRoom } from "./MemoryRoom";
// 重置memory
export const memoryRefresh = {
  refresh: function(): void {
    memoryRoom.refresh();
    memoryDelete.deleteDead();
    memoryRoles.refresh();
  }
}