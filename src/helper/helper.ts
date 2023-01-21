import { tasks } from "@/Tasks/Tasks";

global.helper = function(text: string): string {
  switch (text) {
    case 'controller': {
      for (let name in Memory.rooms) {
        let room = Memory.rooms[name];
        let controller = Game.getObjectById(room.controller);
        let progress = +(controller.progress / controller.progressTotal).toFixed(2) * 100;
        console.log(name);
        console.log(controller.level);
        console.log('升级还需要', controller.progressTotal - controller.progress);
        console.log('已升级完成', progress + '%');
        console.log('可用安全模式次数为：', controller.safeModeAvailable);
        console.log('-------------------------------------------------------');
      }
      break;
    }
  }
  return 'complete';
}