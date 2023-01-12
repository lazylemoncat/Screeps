[TOC]

# Screeps-WORLD、
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
运输优先级为离源最近的container，extension，所有可以存储的容器
当不在Spawn1的房间时，回到房间
#### RoleUpgrader.ts
当upgrader能量满时升级控制器，能量空时去容器中拿取或采集
能量满时若紧邻最近的源，则往控制器走一步
#### RoleBuilder.ts
当builder能量满时向工地添加进度，能量空时去容器中拿取或采集
当不在Spawn1的房间时，回到房间
#### RoleTransfer.ts
当transfer能量空时向紧邻源的container拿取能量，如果container空了或不存在，则找其他的有能量的container或storage拿取能量。
当transfer有能量时，转移能量至需要能量的地方，优先级为：扩展或虫卵，塔，其他容器
#### RoleRepairer.ts
当repairer能量满时向建筑增加耐久，能量空时去容器中拿取或采集
### Structure
#### StructureTower.ts

若房间中存在敌对的creep，则攻击最近的creep

若房间中存在受伤的我方creep，则治疗该creep

修复建筑耐久