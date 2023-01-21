import { tasks } from "@/Tasks/Tasks";

global.helper = function(text: string) {
  switch (text) {
    case 'controller': {
      for (let name in Memory.rooms) {
        let room = Memory.rooms[name];
        let controller = Game.getObjectById(room.controller);
        let progress = controller.progress / controller.progressTotal;
        console.log(name);
        console.log(controller.level);
        console.log('升级还需要', controller.progressTotal - controller.progress,  progress);
        console.log('可用安全模式次数为：', controller.safeModeAvailable);
        console.log('-------------------------------------------------------');
      }
      break;
    }
    case 'tasks': {
      console.log('withdrawTasks:');
      for (let i = 0; i < tasks.withdraw.length; ++i) {
        console.log(tasks.withdraw[i]);
      }
      console.log('transferTasks:');
      for (let i = 0; i < tasks.transfer.length; ++i) {
        console.log(tasks.transfer[i]);
      }
      console.log('-------------------------------------------------------');
      break;
    }
  }
  
}