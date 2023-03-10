'use strict';

const upgradeFlag = {
    find: function (name, roomMemory) {
        let room = Game.getObjectById(roomMemory.controller).room;
        let flags = room.find(FIND_FLAGS);
        for (let i = 0; i < flags.length; ++i) {
            switch (flags[i].name) {
                case 'slowlyUpgrade': return 'slowlyUpgrade';
                default: continue;
            }
        }
        return null;
    }
};

global.helper = function (text) {
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
                console.log('mode:', upgradeFlag.find('slowlyUpgrade', room));
                console.log('可用安全模式次数为：', controller.safeModeAvailable);
                console.log('-------------------------------------------------------');
            }
            break;
        }
    }
    return 'complete';
};

const memoryDelete = {
    // 删除死去的creep的memory
    deleteDead: function () {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },
    // 单独删除一个对象的memory
    delete: function (index, isCreep, role) {
        if (isCreep) {
            switch (role) {
                case 'harvester':
                    Memory.roles.harvesters.splice(index, 1);
                    break;
                case 'miner':
                    Memory.roles.miners.splice(index, 1);
                    break;
                case 'carrier':
                    Memory.roles.carriers.splice(index, 1);
                    break;
                case 'transferer':
                    Memory.roles.carriers.splice(index, 1);
                    break;
                case 'builder':
                    Memory.roles.builders.splice(index, 1);
                    break;
                case 'upgrader':
                    Memory.roles.upgraders.splice(index, 1);
                    break;
                case 'repairer':
                    Memory.roles.repairers.splice(index, 1);
                    break;
                case 'claimer':
                    Memory.roles.claimers.splice(index, 1);
                    break;
                case 'attacker':
                    Memory.roles.attackers.splice(index, 1);
                    break;
            }
        }
    }
};

// 在memory中储存各个角色的Id
const memoryRoles = {
    refresh: function () {
        let roles = returnIds();
        Memory.roles = {
            // Id<Creep>[]
            harvesters: roles.harvester,
            outer_harvesters: roles.outer_harvester,
            miners: roles.miner,
            carriers: roles.carrier,
            transferers: roles.transferer,
            upgraders: roles.upgrader,
            builders: roles.builder,
            repairers: roles.repairer,
            claimers: roles.claimer,
            attackers: roles.attacker,
        };
    }
};
function returnIds() {
    let roles = {
        harvester: [],
        outer_harvester: [],
        miner: [],
        carrier: [],
        transferer: [],
        upgrader: [],
        builder: [],
        repairer: [],
        claimer: [],
        attacker: [],
    };
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role != undefined) {
            roles[creep.memory.role].push(creep.id);
        }
    }
    return roles;
}

// 储存各个房间的相关信息
const memoryRoom = {
    refresh: function () {
        Memory.rooms = {};
        for (let name in Game.rooms) {
            if (Game.rooms[name].controller.owner.username != 'LazyKitty') {
                continue;
            }
            let structures = Game.rooms[name].find(FIND_STRUCTURES);
            Memory.rooms[name] = {
                // Id<Source>[]
                sources: Game.rooms[name].find(FIND_SOURCES).map(source => source.id),
                // Id
                mineral: Game.rooms[name].find(FIND_MINERALS)[0].id,
                // Id<StructureController>
                controller: Game.rooms[name].controller.id,
                // Id<AnyStructure>[]
                structures: structures.map(structure => structure.id),
                // Id<StructureSpawn>[]
                spawns: structures.filter(structure => structure.structureType == STRUCTURE_SPAWN).
                    map(structure => structure.id),
                // Id<ConstructionSite>[]
                sites: Game.rooms[name].find(FIND_CONSTRUCTION_SITES).map(site => site.id),
                // Id<StructureContainer>[]
                containers: structures.filter(structure => structure.structureType == STRUCTURE_CONTAINER).
                    map(structure => structure.id),
                // Id<
                towers: structures.filter(structure => structure.structureType == STRUCTURE_TOWER).
                    map(structure => structure.id),
                // Id<StructureStorage>
                storage: Game.rooms[name].storage ? Game.rooms[name].storage.id : null,
                // StructureLink[]
                links: structures.filter(structure => structure.structureType == STRUCTURE_LINK).
                    map(structure => structure.id),
                // harvested energy fromLink~toLink
                fromLinks: creatLinks('from'),
                toLinks: creatLinks('to'),
            };
        }
    }
};
function creatLinks(context) {
    let from = [];
    let to = [];
    let links = Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_LINK });
    let sources = Object.values(Game.rooms)[0].find(FIND_SOURCES);
    for (let i = 0; i < links.length; ++i) {
        if (links[i].pos.findInRange(sources, 3)[0] != undefined) {
            from.push(links[i].id);
        }
        else {
            to.push(links[i].id);
        }
    }
    switch (context) {
        case 'from': return from;
        case 'to': return to;
    }
    return [];
}

// 重置memory
const memoryRefresh = {
    refresh: function () {
        memoryRoom.refresh();
        memoryDelete.deleteDead();
        memoryRoles.refresh();
    }
};

Creep.prototype.myMove = function (target) {
    // 初次寻找路线
    if (this.memory.path == null || this.memory.path.id != target.id) {
        let path = this.pos.findPathTo(target);
        if (target.pos.x != path[path.length - 1].x && target.pos.y != path[path.length - 1].y) {
            return;
        }
        this.memory.path = { path: Room.serializePath(path), id: target.id, lastPos: [this.pos.x, this.pos.y] };
        this.moveByPath(path);
    }
    else {
        let path = Room.deserializePath(this.memory.path.path);
        let res = this.moveByPath(path);
        if (res != OK || this.pos.x == this.memory.path.lastPos[0] && this.pos.y == this.memory.path.lastPos[1]) {
            let idx = path.findIndex(i => i.x == this.pos.x && i.y == this.pos.y);
            // 简单的对穿
            if (idx !== -1) {
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
};

const structureLink = {
    run: function (link, room) {
        // fromlink 运输能量给 tolink
        for (let i = 0; i < room.fromLinks.length; ++i) {
            if (room.fromLinks[i] == link.id) {
                transfer$1(link, room);
                break;
            }
        }
        return;
    },
};
function transfer$1(link, room) {
    if (link.store[RESOURCE_ENERGY] >= 100) {
        for (let i = 0; i < room.toLinks.length; ++i) {
            let energy = Game.getObjectById(room.toLinks[i]).store.getFreeCapacity(RESOURCE_ENERGY);
            if (energy > 10) {
                link.transferEnergy(Game.getObjectById(room.toLinks[i]));
                return;
            }
        }
    }
}

const structureTower = {
    run: function (tower) {
        // 优先执行攻击指令,其次治疗,最后修复建筑耐久
        let enemy = tower.room.find(FIND_HOSTILE_CREEPS);
        let injured = tower.room.find(FIND_MY_CREEPS, { filter: (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creeps.room });
        if (enemy[0] != undefined) {
            goAttack(tower, enemy);
        }
        else if (injured[0] != undefined) {
            tower.heal(injured[0]);
        }
        else {
            runRepair(tower);
        }
        return;
    }
};
function goAttack(tower, enemy) {
    // 攻击最近的敌人
    let target = tower.pos.findClosestByRange(enemy);
    tower.attack(target);
    return;
}
function runRepair(tower) {
    let targetTo = tower.room.find(FIND_STRUCTURES).filter(object => object.hits < object.hitsMax && object.structureType != STRUCTURE_WALL &&
        object.structureType != STRUCTURE_RAMPART);
    tower.repair(targetTo[0]);
    return;
}

const roleMiner = {
    run: function (creep, room) {
        if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK)) {
            transferEnergy$1(creep, room);
            return;
        }
        goHarvest$1(creep, room);
        return;
    },
};
function goHarvest$1(creep, room) {
    let mineral = Game.getObjectById(room.mineral);
    if (!creep.pos.isNearTo(mineral)) {
        creep.myMove(mineral);
        return;
    }
    creep.harvest(mineral);
    return;
}
function transferEnergy$1(creep, room) {
    let storage = Game.getObjectById(room.storage);
    if (!creep.pos.isNearTo(storage)) {
        creep.myMove(storage);
        return;
    }
    let type = Object.keys(creep.store)[0];
    creep.transfer(storage, type);
    return;
}

// 返回孵化creep需要的部件数组
const newCreepBody = function (role, spawn) {
    // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
    let capacity = Game.getObjectById(spawn).room.energyCapacityAvailable;
    if (capacity == 300 || Game.getObjectById(spawn).room.find(FIND_CREEPS).length < 4) {
        switch (role) {
            case 'harvester': return [WORK, CARRY, MOVE];
            case 'upgrader': return [WORK, CARRY, MOVE];
            case 'builder': return [WORK, CARRY, MOVE, MOVE];
            case 'carrier': return [CARRY, MOVE];
            case 'repairer': return [WORK, CARRY, MOVE, MOVE];
        }
    }
    else {
        switch (role) {
            case 'harvester': {
                let bodys = [CARRY, MOVE];
                capacity /= 50;
                capacity -= 2;
                for (; capacity >= 5; capacity -= 5) {
                    bodys.push(WORK, WORK, MOVE);
                    if (bodys.length >= 8) {
                        if (capacity >= 2) {
                            bodys.push(WORK);
                        }
                        break;
                    }
                }
                return bodys;
            }
            case 'upgrader': {
                let bodys = [];
                capacity /= 50;
                bodys.push(WORK, CARRY, MOVE);
                capacity -= 4;
                for (; capacity >= 5; capacity -= 5) {
                    bodys.push(WORK, WORK, MOVE);
                    if (bodys.length == 9)
                        break;
                }
                return bodys;
            }
            case 'builder': {
                let bodys = [];
                for (capacity /= 50; capacity >= 4; capacity -= 4) {
                    bodys.push(WORK, CARRY, MOVE);
                    if (bodys.length == 12)
                        break;
                }
                return bodys;
            }
            case 'carrier': {
                let bodys = [];
                for (capacity /= 50; capacity >= 2; capacity -= 2) {
                    bodys.push(MOVE, CARRY);
                    if (bodys.length == 20)
                        break;
                }
                return bodys;
            }
            case 'repairer': {
                let bodys = [];
                for (capacity /= 50; capacity >= 5; capacity -= 5) {
                    bodys.push(WORK, CARRY, MOVE, MOVE);
                    if (bodys.length == 12)
                        break;
                }
                return bodys;
            }
            case 'claimer': {
                if (capacity >= 650) {
                    return [CLAIM, MOVE];
                }
                else {
                    return [];
                }
            }
        }
    }
    return [];
};

const tasks = {
    withdraw: [],
    transfer: [],
    returnTransfer: function (room) {
        findTransferTask(room);
        const structureType = ['spawn', 'extension', 'tower', 'container', 'storage',];
        tasks.transfer.sort(function (a, b) {
            let typea = structureType.indexOf(a.type);
            let typeb = structureType.indexOf(b.type);
            return typea - typeb;
        });
        return tasks.transfer;
    },
    returnWithdraw: function (room) {
        findWithdraw(room);
        const type = ['creep', 'link', 'container', 'storage',];
        tasks.withdraw.sort(function (a, b) {
            let typea = type.indexOf(a.type);
            let typeb = type.indexOf(b.type);
            let res = typea - typeb;
            if (res != 0) {
                return res;
            }
            else {
                let posa = Game.getObjectById(a.id).pos.y;
                let posb = Game.getObjectById(b.id).pos.y;
                return posa - posb;
            }
        });
        return tasks.withdraw;
    },
    findTask: function (type, obj) {
        if (type == 'transfer') {
            let index = tasks.transfer.findIndex(i => i.id == obj.id);
            if (index != -1) {
                if (tasks.transfer[index].energy <= 0) {
                    tasks.transfer.splice(index, 1);
                }
                return true;
            }
        }
        return false;
    },
};
function findWithdraw(room) {
    withdrawTask('link', room);
    withdrawTask('container', room);
    withdrawTask('storage', room);
    return;
}
function findTransferTask(room) {
    transferTask$1('spawn', room);
    transferTask$1('extension', room);
    transferTask$1('tower', room);
    transferTask$1('container', room);
    transferTask$1('storage', room);
    return;
}
function transferTask$1(type, room) {
    let targets = room.structures.filter(structure => Game.getObjectById(structure).structureType == type);
    for (let i = 0; i < targets.length; ++i) {
        let energy = Game.getObjectById(targets[i]).store.getFreeCapacity(RESOURCE_ENERGY);
        let obj = { type: type, id: targets[i], energy: energy };
        if (tasks.findTask('transfer', obj)) {
            continue;
        }
        if (energy == 0) {
            continue;
        }
        if (!tasks.transfer.some(i => i.id == obj.id) &&
            Game.getObjectById(targets[i]).pos.findInRange(FIND_SOURCES, 2).length == 0) {
            tasks.transfer.push(obj);
        }
    }
    return;
}
function withdrawTask(type, room) {
    switch (type) {
        case 'link': {
            let links = room.toLinks;
            for (let i = 0; i < links.length; ++i) {
                let link = Game.getObjectById(links[i]);
                let energy = link.store[RESOURCE_ENERGY];
                let obj = { type: 'link', id: link.id, energy: energy };
                if (energy > 100 && !tasks.withdraw.find(i => i.id == obj.id)) {
                    tasks.withdraw.push(obj);
                }
            }
            break;
        }
        case 'container': {
            let containers = room.containers;
            for (let i = 0; i < containers.length; ++i) {
                if (Game.getObjectById(containers[i]).pos.findInRange(FIND_SOURCES, 1).length != 0) {
                    let container = Game.getObjectById(containers[i]);
                    let energy = container.store[RESOURCE_ENERGY];
                    let obj = { type: 'container', id: container.id, energy: energy };
                    if (energy >= 50 && !tasks.withdraw.find(i => i.id == obj.id)) {
                        tasks.withdraw.push(obj);
                    }
                }
            }
            break;
        }
        case 'storage': {
            let storage = Game.getObjectById(room.storage);
            if (storage != undefined) {
                let energy = storage.store[RESOURCE_ENERGY];
                let obj = { type: 'storage', id: storage.id, energy: energy };
                if (!tasks.withdraw.find(i => i.id == obj.id) && energy >= 50) {
                    tasks.withdraw.push(obj);
                }
            }
            break;
        }
    }
    return;
}

const roleHarvester = {
    run: function (creep, room) {
        let transfered = false;
        // 避免采集过多能量掉在地上造成浪费
        if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK) * 2) {
            transfered = transferEnergy(creep, room);
        }
        goHarvest(creep, transfered, room);
    }
};
function goHarvest(creep, transfered, room) {
    let source = Game.getObjectById(creep.memory.sourcesPosition);
    if (!creep.pos.isNearTo(source)) {
        creep.myMove(source);
        return;
    }
    if (source.energy == 0 ||
        creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
        return;
    }
    let containers = room.containers.map(i => Game.getObjectById(i));
    let container = creep.pos.findInRange(containers, 1)[0];
    if (container != undefined) {
        if (!creep.pos.isEqualTo(container)) {
            creep.myMove(container);
        }
    }
    creep.harvest(source);
    return;
}
function transferEnergy(creep, room) {
    if (Game.getObjectById(creep.memory.waiting) != null) {
        return;
    }
    let links = room.links;
    let containers = room.containers.map(i => Game.getObjectById(i));
    let sources = room.sources;
    // 若creep身边无link,container则发布一个withdraw任务让carrier拿走能量
    if (links.length == 0 && containers.length < sources.length &&
        creep.pos.findInRange(containers, 1).length == 0) {
        let obj = { type: 'creep', id: creep.id, energy: creep.store[RESOURCE_ENERGY] };
        if (!tasks.withdraw.find(i => i.id == creep.id)) {
            tasks.withdraw.push(obj);
        }
        return false;
    }
    if (!transfer(creep, room)) {
        return false;
    }
    return true;
}
function transfer(creep, room) {
    // 优先将能量送往link,若身边有link,则不再将能量送进container中
    let links = room.links.map(i => Game.getObjectById(i));
    let link = creep.pos.findInRange(links, 1)[0];
    if (link != undefined) {
        if (creep.transfer(link, RESOURCE_ENERGY) == OK) {
            return true;
        }
        return false;
    }
    let containers = room.containers.map(i => Game.getObjectById(i));
    let container = creep.pos.findInRange(containers, 1)[0];
    if (container != undefined) {
        if (creep.transfer(container, RESOURCE_ENERGY) == OK) {
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}

const harvestTask = {
    run: function (room) {
        newCreep(room);
        for (let i = 0; i < Memory.roles.harvesters.length; ++i) {
            let harvester = Game.getObjectById(Memory.roles.harvesters[i]);
            if (harvester == null) {
                memoryDelete.delete(i, true, 'harvester');
                continue;
            }
            roleHarvester.run(harvester, room);
        }
        for (let i = 0; i < Memory.roles.miners.length; ++i) {
            let miner = Game.getObjectById(Memory.roles.miners[i]);
            if (miner == null) {
                memoryDelete.delete(i, true, 'miner');
                continue;
            }
            roleMiner.run(miner, room);
        }
        return;
    }
};
function newCreep(room) {
    let harvesters = Memory.roles.harvesters;
    let carriers = Memory.roles.carriers;
    let sources = room.sources;
    Game.spawns['Spawn1'].memory.shouldSpawn = null;
    if (harvesters.length <= carriers.length && harvesters.length < sources.length) {
        Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
        newHarvester(harvesters, sources.length, room);
    }
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let miners = Memory.roles.miners;
    if (miners.length < 1 && harvesters.length + carriers.length >= sources.length * 2) {
        let extractor = Game.getObjectById(room.mineral).pos.findInRange(FIND_STRUCTURES, 0)[0];
        if (extractor != null) {
            Game.spawns['Spawn1'].memory.shouldSpawn = 'miner';
            let newName = "Miner" + Game.time;
            let bodys = newCreepBody('harvester', room.spawns[0]);
            Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'miner' } });
        }
    }
    return;
}
function newHarvester(harvesters, sourcesLength, room) {
    let posFlag = 0;
    for (let i = 0; i < sourcesLength; ++i) {
        for (let j = 0; j < harvesters.length; ++j) {
            let harvester = Game.getObjectById(harvesters[j]);
            if (Game.getObjectById(room.sources[i]).id == harvester.memory.sourcesPosition) {
                posFlag += 1;
                break;
            }
        }
        if (posFlag == i)
            break;
    }
    if (posFlag >= sourcesLength)
        return;
    let newName = "Harvester" + Game.time;
    let sourceId = Game.getObjectById(room.sources[posFlag]).id;
    let memory = { role: 'harvester', sourcesPosition: sourceId };
    let bodys = newCreepBody('harvester', room.spawns[0]);
    if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: memory }) == OK) ;
    return;
}

const outerTask = {
    run: function () {
        for (let i = 0; i < Memory.Outer.length; ++i) {
            let room = Memory.Outer[i];
            if (Game.flags.outer == undefined) {
                let flag = Game.flags[Game.spawns.Spawn1.pos.createFlag('outer')];
                flag.setPosition(new RoomPosition(25, 25, room.roomName));
                flag.remove();
            }
            if (room.isInit != true) {
                initRoom(i);
            }
            //newCreep(i);
        }
        for (let i = 0; i < Memory.roles.outer_harvesters.length; i++) {
            let harvester = Game.getObjectById(Memory.roles.outer_harvesters[i]);
            if (harvester == null) {
                memoryDelete.delete(i, true, 'outer_harvester');
                continue;
            }
        }
    }
};
function initRoom(roomIndex) {
    let room = Memory.Outer[roomIndex];
    room.harvestersNum = 0;
    if (Game.rooms[room.roomName] == undefined) {
        return;
    }
    let sources = Game.rooms[room.roomName].find(FIND_SOURCES);
    for (let i = 0; i < sources.length; i++) {
        room.sources.push(sources[i].id);
    }
    room.isInit = true;
    return;
}

const roleTransferer = {
    // 判断接收withdraw任务还是transfer任务
    isTransfering: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }
        return creep.memory.transfering;
    },
    // 从storage获取能量
    goWithdraw: function (creep, room) {
        let storage = Game.getObjectById(room.storage);
        if (storage == null) {
            return;
        }
        if (storage.store[RESOURCE_ENERGY] == 0) {
            let links = room.links.map(i => Game.getObjectById(i));
            let link = storage.pos.findInRange(links, 1)[0];
            if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.myMove(link);
            }
            return;
        }
        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.myMove(storage);
        }
        return;
    },
    // 运输能量
    goTransfer: function (creep, task) {
        creep.memory.carrierTarget = task;
        let target = Game.getObjectById(task);
        if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.carrierTarget = null;
            return;
        }
        let res = 0;
        res = creep.transfer(target, RESOURCE_ENERGY);
        switch (res) {
            case OK:
                creep.memory.carrierTarget = null;
                break;
            case ERR_NOT_IN_RANGE:
                creep.myMove(target);
                break;
        }
        return;
    }
};

const roleCarrier = {
    // 判断接收withdraw任务还是transfer任务
    isTransfering: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }
        return creep.memory.transfering;
    },
    goTransfer: function (creep, task) {
        creep.memory.carrierTarget = task;
        let target = Game.getObjectById(task);
        if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.carrierTarget = null;
            return;
        }
        let res = 0;
        res = creep.transfer(target, RESOURCE_ENERGY);
        switch (res) {
            case OK:
                creep.memory.carrierTarget = null;
                break;
            case ERR_NOT_IN_RANGE:
                creep.myMove(target);
                break;
        }
        return;
    },
    goWithdraw: function (creep, task) {
        let target = Game.getObjectById(task);
        creep.memory.carrierTarget = task;
        if (target == null || target.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrierTarget = null;
            return;
        }
        let res = 0;
        if (target instanceof Creep) {
            res = target.transfer(creep, RESOURCE_ENERGY);
            target.memory.waiting = creep.id;
            switch (res) {
                case OK:
                    creep.memory.carrierTarget = null;
                    target.memory.waiting = null;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.myMove(target);
                    break;
            }
        }
        else {
            res = creep.withdraw(target, RESOURCE_ENERGY);
            switch (res) {
                case OK:
                    creep.memory.carrierTarget = null;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.myMove(target);
                    break;
            }
        }
        return;
    },
};

const transferTask = {
    run: function (room) {
        newCarrier(room);
        newTransferer(room);
        let withdrawTask = tasks.returnWithdraw(room);
        let transferTask = tasks.returnTransfer(room);
        let transferIndex = 0;
        for (let i = 0; i < Memory.roles.transferers.length; ++i) {
            let transferer = Game.getObjectById(Memory.roles.transferers[i]);
            if (transferer == null) {
                memoryDelete.delete(i, true, 'transferer');
                continue;
            }
            let isTransfering = roleTransferer.isTransfering(transferer);
            if (isTransfering) {
                if (transferTask[transferIndex] == undefined || transferTask[transferIndex].id == room.storage) {
                    continue;
                }
                if (transferer.memory.carrierTarget != null) {
                    roleTransferer.goTransfer(transferer, transferer.memory.carrierTarget);
                    continue;
                }
                roleTransferer.goTransfer(transferer, transferTask[transferIndex].id);
                transferTask[transferIndex].energy -= transferer.store[RESOURCE_ENERGY];
                if (transferTask[transferIndex].energy <= 0) {
                    // transferTask.shift();
                    transferIndex++;
                }
            }
            else {
                roleTransferer.goWithdraw(transferer, room);
            }
        }
        for (let i = 0; i < Memory.roles.carriers.length; ++i) {
            let carrier = Game.getObjectById(Memory.roles.carriers[i]);
            if (carrier == null) {
                memoryDelete.delete(i, true, 'carrier');
                continue;
            }
            let isTransfering = roleCarrier.isTransfering(carrier);
            if (carrier.memory.carrierTarget != null) {
                if (isTransfering) {
                    roleCarrier.goTransfer(carrier, carrier.memory.carrierTarget);
                }
                else {
                    roleCarrier.goWithdraw(carrier, carrier.memory.carrierTarget);
                }
                continue;
            }
            if (isTransfering) {
                if (transferTask[transferIndex] == undefined) {
                    continue;
                }
                roleCarrier.goTransfer(carrier, transferTask[transferIndex].id);
                transferTask[transferIndex].energy -= carrier.store[RESOURCE_ENERGY];
                if (transferTask[transferIndex].energy <= 0) {
                    // transferTask.shift();
                    transferIndex++;
                }
            }
            else {
                if (withdrawTask[0] == undefined) {
                    continue;
                }
                roleCarrier.goWithdraw(carrier, withdrawTask[0].id);
                withdrawTask[0].energy -= carrier.store.getFreeCapacity(RESOURCE_ENERGY);
                if (withdrawTask[0].energy <= 0) {
                    withdrawTask.shift();
                }
            }
        }
        return;
    }
};
function newCarrier(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let harvesters = Memory.roles.harvesters;
    let carriers = Memory.roles.carriers;
    let sources = room.sources;
    if (carriers.length >= harvesters.length && carriers.length >= sources.length) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'carrier';
    let newName = 'Carrier' + Game.time;
    let bodys = newCreepBody('carrier', room.spawns[0]);
    if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'carrier', } }) == OK) ;
    return;
}
function newTransferer(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    if (Game.getObjectById(room.storage) == null || Memory.roles.transferers.length > 0) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'transferer';
    let newName = 'Transferer' + Game.time;
    let bodys = newCreepBody('carrier', room.spawns[0]);
    Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'transferer', } });
    return;
}

const roleUpgrader = {
    run: function (creep, room) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
        }
        if (creep.memory.upgrading) {
            goUpgrade(creep);
        }
        else {
            goGetEnergy$2(creep, room);
        }
    }
};
function goUpgrade(creep) {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.myMove(creep.room.controller);
    }
    return;
}
function goGetEnergy$2(creep, room) {
    let creepNeed = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    let controller = creep.room.controller;
    let containers = room.containers.map(i => Game.getObjectById(i));
    let container = controller.pos.findInRange(containers, 2)[0];
    if (container != undefined && container.store[RESOURCE_ENERGY] >= creepNeed) {
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.myMove(container);
        }
        return;
    }
    else {
        let target = creep.room.find(FIND_STRUCTURES).filter(i => (i.structureType == STRUCTURE_CONTAINER ||
            i.structureType == STRUCTURE_STORAGE) &&
            i.store[RESOURCE_ENERGY] >= creepNeed);
        if (target[0] != undefined) {
            if (creep.withdraw(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.myMove(target[0]);
            }
        }
        else {
            let source = Game.getObjectById(room.sources[0]);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.myMove(source);
            }
        }
    }
    return;
}

const upgradeTask = {
    run: function (room) {
        newUpgrader(room);
        for (let i = 0; i < Memory.roles.upgraders.length; ++i) {
            let upgrader = Game.getObjectById(Memory.roles.upgraders[i]);
            if (upgrader == null) {
                memoryDelete.delete(i, true, 'upgrader');
                continue;
            }
            roleUpgrader.run(upgrader, room);
        }
        return;
    }
};
function newUpgrader(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let upgradersNum = room.sites.length > 0 ? 1 : 3;
    let flag = Game.flags.slowlyUpgrade;
    if (flag != undefined && flag.room == Game.getObjectById(room.controller).room) {
        upgradersNum = 1;
    }
    if (Game.getObjectById(room.controller).level == 8) {
        upgradersNum = 1;
    }
    if (Memory.roles.upgraders.length >= upgradersNum) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'upgrader';
    let newName = 'Upgrader' + Game.time;
    let bodys = newCreepBody('upgrader', room.spawns[0]);
    if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'upgrader' } }) == OK) ;
    return;
}

const roleBuilder = {
    run: function (creep, room) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        else if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }
        if (creep.memory.building) {
            goBuild(creep, room);
        }
        else {
            goGetEnergy$1(creep, room);
        }
    }
};
function goBuild(creep, room) {
    let sites = room.sites;
    let target = Game.getObjectById(sites[0]);
    if (target) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.myMove(target);
        }
    }
    return;
}
function goGetEnergy$1(creep, room) {
    let creepNeed = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    // 优先从storage，container中拿取能量，若能量不足或无建筑则从source中采集
    if (creep.memory.carrierTarget == null) {
        let targetStore = null;
        if (room.storage != undefined &&
            Game.getObjectById(room.storage).store[RESOURCE_ENERGY] >= creepNeed) {
            targetStore = Game.getObjectById(room.storage);
        }
        else if (room.containers[0] != undefined) {
            let containers = room.containers.map(i => Game.getObjectById(i));
            targetStore = creep.pos.findClosestByRange(containers, { filter: store => store.store[RESOURCE_ENERGY] >= creepNeed });
        }
        if (targetStore == null) {
            let sources = Game.getObjectById(room.sources[0]);
            if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                creep.myMove(sources);
            }
            return;
        }
        // 将对象存储入creep内存中
        creep.memory.carrierTarget = targetStore.id;
    }
    let target = Game.getObjectById(creep.memory.carrierTarget);
    if (target == null || target.store[RESOURCE_ENERGY] < creepNeed) {
        creep.memory.carrierTarget = null;
        return;
    }
    let res = creep.withdraw(target, RESOURCE_ENERGY);
    switch (res) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        case OK:
            creep.memory.carrierTarget = null;
            break;
    }
    return;
}

const roleRepairer = {
    run: function (creep, room) {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            global.repairerTarget = null;
        }
        else if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
        }
        if (creep.memory.repairing) {
            goRepair(creep, room);
        }
        else {
            goGetEnergy(creep, room);
        }
    }
};
function goRepair(creep, room) {
    // 根据repairer的内存直接找到对象
    let repairTarget = Game.getObjectById(creep.memory.repairtarget);
    if (repairTarget != null && repairTarget.hits < repairTarget.hitsMax) {
        if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
            creep.myMove(repairTarget);
        }
        return;
    }
    let injured = creep.room.find(FIND_STRUCTURES).filter(object => object.hits < object.hitsMax);
    let targetTo = [];
    // 若有tower,则专心修墙
    if (room.towers.length == 0) {
        targetTo = injured.filter(structure => structure.structureType != STRUCTURE_WALL);
    }
    else {
        targetTo = injured.sort((a, b) => a.hits - b.hits);
    }
    creep.memory.repairtarget = targetTo[0].id;
    if (creep.repair(targetTo[0]) == ERR_NOT_IN_RANGE) {
        creep.myMove(targetTo[0]);
    }
    return;
}
function goGetEnergy(creep, room) {
    let creepNeed = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    // 优先从storage，container中拿取能量，若能量不足或无建筑则从source中采集
    if (creep.memory.carrierTarget == null) {
        let targetStore = null;
        if (room.storage != undefined &&
            Game.getObjectById(room.storage).store[RESOURCE_ENERGY] >= creepNeed) {
            targetStore = Game.getObjectById(room.storage);
        }
        else if (room.containers[0] != undefined) {
            let containers = room.containers.map(i => Game.getObjectById(i));
            targetStore = creep.pos.findClosestByRange(containers, { filter: store => store.store[RESOURCE_ENERGY] >= creepNeed });
        }
        if (targetStore == null) {
            let sources = Game.getObjectById(room.sources[0]);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.myMove(sources[0]);
            }
            return;
        }
        // 将对象存储入creep内存中
        creep.memory.carrierTarget = targetStore.id;
    }
    let target = Game.getObjectById(creep.memory.carrierTarget);
    if (target == null || target.store[RESOURCE_ENERGY] < creepNeed) {
        creep.memory.carrierTarget = null;
        return;
    }
    let res = creep.withdraw(target, RESOURCE_ENERGY);
    switch (res) {
        case ERR_NOT_IN_RANGE:
            creep.myMove(target);
            break;
        case OK:
            creep.memory.carrierTarget = null;
            break;
    }
    return;
}

const buildTask = {
    run: function (room) {
        newBuilder(room);
        for (let i = 0; i < Memory.roles.builders.length; ++i) {
            let builder = Game.getObjectById(Memory.roles.builders[i]);
            if (builder == null) {
                memoryDelete.delete(i, true, 'builder');
                continue;
            }
            if (room.sites.length == 0) {
                roleRepairer.run(builder, room);
            }
            else {
                roleBuilder.run(builder, room);
            }
        }
        return;
    }
};
function newBuilder(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let builders = Memory.roles.builders;
    let sites = room.sites;
    if (!(sites.length > 0 && builders.length < 2)) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'builder';
    let newName = 'Builder' + Game.time;
    let bodys = newCreepBody('builder', room.spawns[0]);
    if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'builder' } }) == OK) ;
    return;
}

const repairTask = {
    run: function (room) {
        newRepairer(room);
        for (let i = 0; i < Memory.roles.repairers.length; ++i) {
            let repaier = Game.getObjectById(Memory.roles.repairers[i]);
            if (repaier == null) {
                memoryDelete.delete(i, true, 'repairer');
                continue;
            }
            roleRepairer.run(repaier, room);
        }
        return;
    }
};
function newRepairer(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let repairers = Memory.roles.repairers;
    let containers = room.containers;
    if (repairers.length >= 1 || containers.length == 0) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'repairer';
    let newName = 'Repairer' + Game.time;
    let bodys = newCreepBody('repairer', room.spawns[0]);
    if (Game.spawns['Spawn1'].spawnCreep(bodys, newName, { memory: { role: 'repairer' } }) == OK) ;
    return;
}

const memoryAppend = {
    append: function (id, isCreep, role) {
        if (isCreep) {
            let creepId = id;
            if (Memory.roles[role + 's'].includes(id)) {
                return;
            }
            switch (role) {
                case 'harvester':
                    Memory.roles.harvesters.push(creepId);
                    break;
                case 'Outer_harvester':
                    Memory.roles.outer_harvesters.push(creepId);
                    break;
                case 'miner':
                    Memory.roles.miners.push(creepId);
                    break;
                case 'carrier':
                    Memory.roles.carriers.push(creepId);
                    break;
                case 'builder':
                    Memory.roles.builders.push(creepId);
                    break;
                case 'upgrader':
                    Memory.roles.upgraders.push(creepId);
                    break;
                case 'repairer':
                    Memory.roles.repairers.push(creepId);
                    break;
                case 'attacker':
                    Memory.roles.attackers.push(creepId);
                    break;
            }
        }
    }
};

const structureSpawn = {
    appendMemory: function (room) {
        for (let i = 0; i < room.spawns.length; ++i) {
            let spawn = Game.getObjectById(room.spawns[i]);
            if (spawn.spawning != null) {
                let id = Game.creeps[Game.spawns['Spawn1'].spawning.name].id;
                let role = Game.creeps[Game.spawns['Spawn1'].spawning.name].memory.role;
                memoryAppend.append(id, true, role);
            }
        }
        return;
    }
};

// helper
memoryRefresh.refresh();
const loop = function () {
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    // 重置 memory
    if (Game.time % 100 == 0) {
        memoryRefresh.refresh();
    }
    for (let name in Memory.rooms) {
        let room = Memory.rooms[name];
        structureSpawn.appendMemory(room);
        // 执行任务
        harvestTask.run(room);
        transferTask.run(room);
        buildTask.run(room);
        upgradeTask.run(room);
        repairTask.run(room);
        outerTask.run();
        //claimTask.run('W59S26');
        // todo
        // for (let i = 0; i < Memory.roles.attackers.length; ++i) {
        //   let attacker =Game.getObjectById(Memory.roles.attackers[i]);
        //   if (attacker == null) {
        //     memoryDelete.delete(i, true, 'attacker');
        //   }
        //   roleAttacker.run(attacker, 'W58S25');
        // }
        // 执行建筑的run函数
        for (let name in Game.structures) {
            let structure = Game.structures[name];
            switch (structure.structureType) {
                case STRUCTURE_TOWER:
                    structureTower.run(structure);
                    break;
                case STRUCTURE_LINK:
                    structureLink.run(structure, room);
                    break;
            }
        }
    }
    return;
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
