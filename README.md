# Screeps-WORLD
## src

### main.ts

执行生成creep的函数

按memory.role系统依个执行各个creep或structure的run函数

导出loop函数

### index.d.ts

添加了对memoey.role等属性的类型补充，避免ts报错。

### Role
#### RoleHarvester.ts

当harvester能量满时往容器里运，能量空时去采集

运输优先级为最近的container，extension，所有可以存储的容器

当不在Spawn1的房间时，回到房间

#### RoleUpgrader.ts

当upgrader能量满时升级控制器，能量空时去从容器中拿取或采集

能量满时若紧邻最近的源，则往控制器走一步
