[TOC]

# Screeps-WORLD、
## src
### main.ts
执行生成creep的函数
按memory.role系统依个执行各个 creep 或 structure 的 run 函数
导出loop函数

### index.d.ts
添加了对 memoey.role 等属性的类型补充，避免ts报错。
### Role
#### RoleHarvester.ts
当 harvester 能量满时往容器里运，能量空时去采集
运输优先级为离源最近的 container ， extension ，所有可以存储的容器
当不在Spawn1的房间时，回到房间

#### RoleUpgrader.ts
当 upgrader 能量满时升级控制器，能量空时去容器中拿取或采集
能量满时若紧邻最近的源，则往控制器走一步

#### RoleBuilder.ts
当 builder 能量满时向工地添加进度，能量空时去容器中拿取或采集
当不在 Spawn1 的房间时，回到房间

#### RoleTransfer.ts
当 transfer 能量空时向紧邻源的 container 拿取能量，如果 container 空了或不存在，则找其他的有能量的 container 或 storage 拿取能量。
当transfer有能量时，转移能量至需要能量的地方，优先级为：扩展或虫卵，塔，其他容器

#### RoleRepairer.ts
当 repairer 能量满时向建筑增加耐久，能量空时去容器中拿取或采集
### Structure
#### StructureTower.ts

若房间中存在敌对的 creep ，则攻击最近的 creep 

若房间中存在受伤的我方 creep ，则治疗该 creep 

修复建筑耐久