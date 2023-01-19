'use strict';

const globalStructure = {
    sources: Object.values(Game.rooms)[0].find(FIND_SOURCES),
    structures: Object.values(Game.rooms)[0].find(FIND_STRUCTURES),
    sites: Object.values(Game.rooms)[0].find(FIND_CONSTRUCTION_SITES),
    containers: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_CONTAINER }),
    links: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_LINK }),
    fromLinks: creatLinks('from'),
    toLinks: creatLinks('to'),
    refresh: function () {
        globalStructure.structures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);
        globalStructure.containers = globalStructure.structures.filter(structure => structure.structureType == STRUCTURE_CONTAINER);
        globalStructure.links = globalStructure.structures.filter(structure => structure.structureType == STRUCTURE_LINK);
        this.fromLinks = creatLinks('from');
        this.toLinks = creatLinks('to');
    }
};
function creatLinks(context) {
    let from = [];
    let to = [];
    let links = Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_LINK });
    let sources = Object.values(Game.rooms)[0].find(FIND_SOURCES);
    for (let i = 0; i < links.length; ++i) {
        if (links[i].pos.findInRange(sources, 3)[0] != undefined) {
            from.push(links[i]);
        }
        else {
            to.push(links[i]);
        }
    }
    switch (context) {
        case 'from': return from;
        case 'to': return to;
    }
    return [];
}

const globalAutoSites = {
    run: function () {
        creatContainerSites();
    }
};
function creatContainerSites() {
    for (let i = 0; i < globalStructure.sources.length; ++i) {
        let containers = globalStructure.sources[i].pos.findInRange(globalStructure.containers, 1);
        if (containers[0] != undefined) {
            continue;
        }
        else {
            let sites = globalStructure.sources[i].pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
            if (sites[0] != undefined) {
                continue;
            }
        }
        let path = Game.spawns.Spawn1.pos.findPathTo(globalStructure.sources[i], { ignoreCreeps: true });
        let posX = path[path.length - 2].x;
        let posY = path[path.length - 2].y;
        let pos = new RoomPosition(posX, posY, Game.spawns.Spawn1.room.name);
        pos.createConstructionSite(STRUCTURE_CONTAINER);
    }
    let contronller = Object.values(Game.rooms)[0].controller;
    let containers = contronller.pos.findInRange(globalStructure.containers, 2);
    let sites = contronller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2);
    if (containers[0] == undefined && sites[0] == undefined) {
        let path = Game.spawns.Spawn1.pos.findPathTo(contronller, { ignoreCreeps: true });
        let posX = path[path.length - 3].x;
        let posY = path[path.length - 3].y;
        let pos = new RoomPosition(posX, posY, Game.spawns.Spawn1.room.name);
        pos.createConstructionSite(STRUCTURE_CONTAINER);
    }
}

const globalRole = {
    // transfer
    transferTarget: [],
    refresh: function () {
        this.transferTarget = [];
    }
};

/**
 * @file to refresh global veriables
 * @author LazyKitty
 */
const refreshGlobal = function () {
    // GlobalStructure.ts
    if (Game.spawns.Spawn1 != undefined) {
        globalStructure.refresh();
        globalAutoSites.run();
        globalRole.refresh();
    }
};

const memoryDelete = {
    deleteDead: function () {
        // delete dead creeps
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
};

const memoryRoles = {
    refresh: function () {
        let roles = returnIds();
        Memory.roles = {
            harvesters: roles.harvester,
            transfers: roles.transfer,
            upgraders: roles.upgrader,
            builders: roles.builder,
            repaiers: roles.repairer,
        };
    }
};
function returnIds() {
    let roles = {
        harvester: [],
        transfer: [],
        upgrader: [],
        builder: [],
        repairer: [],
    };
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role != undefined) {
            roles[creep.memory.role].push(creep.id);
        }
    }
    return roles;
}

const memoryRoom = {
    refresh: function () {
        Memory.room = [];
        for (let name in Game.rooms) {
            Memory.room.push(name);
        }
    }
};

const memoryRefresh = {
    refresh: function () {
        memoryRoom.refresh();
        memoryDelete.deleteDead();
        memoryRoles.refresh();
    }
};

const structureLink = {
    run: function (link) {
        for (let i = 0; i < globalStructure.fromLinks.length; ++i) {
            if (globalStructure.fromLinks[i].id == link.id) {
                transfer$1(link);
                break;
            }
        }
    },
};
function transfer$1(link) {
    if (link.store[RESOURCE_ENERGY] >= 100) {
        for (let i = 0; i < globalStructure.toLinks.length; ++i) {
            let energy = Game.getObjectById(globalStructure.toLinks[i].id).store.getFreeCapacity(RESOURCE_ENERGY);
            if (energy > 10) {
                link.transferEnergy(Game.getObjectById(globalStructure.toLinks[i].id));
                return;
            }
        }
    }
}

const structureTower = {
    run: function (tower) {
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
    }
};
function goAttack(tower, enemy) {
    let target = tower.pos.findClosestByRange(enemy);
    tower.attack(target);
}
function runRepair(tower) {
    let targetTo = tower.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax &&
            object.structureType != STRUCTURE_WALL
    });
    tower.repair(targetTo[0]);
}

const newCreepBody = function (role) {
    // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
    let capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
    if (capacity == 300 || Object.getOwnPropertyNames(Memory.creeps).length < 4) {
        switch (role) {
            case 'harvester': return [WORK, CARRY, MOVE];
            case 'upgrader': return [WORK, CARRY, MOVE];
            case 'builder': return [WORK, CARRY, MOVE, MOVE];
            case 'transfer': return [CARRY, MOVE];
            case 'repairer': return [WORK, CARRY, MOVE, MOVE];
        }
    }
    else {
        switch (role) {
            case 'harvester': {
                let bodys = [CARRY];
                for (capacity /= 50; capacity >= 5; capacity -= 5) {
                    bodys.push(WORK, WORK, MOVE);
                    if (bodys.length >= 7) {
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
                    if (bodys.length == 9)
                        break;
                }
                return bodys;
            }
            case 'transfer': {
                let bodys = [];
                for (capacity /= 50; capacity >= 2; capacity -= 2) {
                    bodys.push(MOVE, CARRY);
                    if (bodys.length == 12)
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
        }
    }
};

const tasks = {
    withdraw: {
        creep: [],
        link: [],
        container: [],
        storage: [],
    },
    transfer: {
        spawn: [],
        extension: [],
        tower: [],
        container: [],
        storage: [],
    },
    returnTransfer: function () {
        findTransferTask$1();
        let task = [];
        for (let key in tasks.transfer) {
            task = task.concat(tasks.transfer[key]);
        }
        return task;
    },
    returnWithdraw: function () {
        findWithdraw();
        let task = [];
        for (let key in tasks.withdraw) {
            task = task.concat(tasks.withdraw[key]);
        }
        return task;
    },
};
function findWithdraw() {
    linkTask('withdraw');
    containerTask('withdraw');
    storageTask('withdraw');
}
function findTransferTask$1() {
    transferTask$1('spawn');
    transferTask$1('extension');
    transferTask$1('tower');
    transferTask$1('container');
    transferTask$1('storage');
}
function transferTask$1(type) {
    let targets = globalStructure.structures.filter(structure => structure.structureType == type &&
        Game.getObjectById(structure.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    for (let i = 0; i < targets.length; ++i) {
        if (!tasks.transfer[type].includes(targets[i].id) &&
            targets[i].pos.findInRange(globalStructure.sources, 2).length == 0) {
            tasks.transfer[type].push(targets[i].id);
        }
    }
}
function linkTask(task) {
    switch (task) {
        case 'withdraw': {
            let links = globalStructure.toLinks;
            for (let i = 0; i < globalStructure.toLinks.length; ++i) {
                let link = Game.getObjectById(links[i].id);
                if (link.store[RESOURCE_ENERGY] > 100 && !tasks.withdraw.link.includes(link.id)) {
                    tasks.withdraw.link.push(link.id);
                }
            }
            break;
        }
    }
}
function containerTask(task) {
    switch (task) {
        case 'withdraw': {
            let containers = globalStructure.containers;
            for (let i = 0; i < containers.length; ++i) {
                if (containers[i].pos.findInRange(globalStructure.sources, 1).length != 0) {
                    let container = Game.getObjectById(containers[i].id);
                    if (container.store[RESOURCE_ENERGY] >= 50 && !tasks.withdraw.container.includes(container.id)) {
                        tasks.withdraw.container.push(container.id);
                    }
                }
            }
            break;
        }
    }
}
function storageTask(task) {
    switch (task) {
        case 'withdraw': {
            let storage = Object.values(Game.rooms)[0].storage;
            if (storage != undefined && !tasks.withdraw.storage.includes(storage.id) &&
                storage.store[RESOURCE_ENERGY] >= 0) {
                tasks.withdraw.storage.push(storage.id);
            }
            break;
        }
    }
}

const roleHarvester = {
    run: function (creep) {
        let transfered = false;
        if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK) * 2) {
            transfered = transferEnergy(creep);
        }
        goHarvest(creep, transfered);
    }
};
function goHarvest(creep, transfered) {
    let source = globalStructure.sources[creep.memory.sourcesPosition];
    if (!creep.pos.isNearTo(source)) {
        creep.moveTo(source);
        return;
    }
    if (source.energy == 0 ||
        creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
        return;
    }
    let container = source.pos.findInRange(globalStructure.containers, 1);
    if (container[0] != undefined) {
        if (!creep.pos.isEqualTo(container[0])) {
            creep.moveTo(container[0]);
        }
    }
    creep.harvest(source);
}
function transferEnergy(creep) {
    if (Game.getObjectById(creep.memory.waiting) != null) {
        return;
    }
    let links = globalStructure.links;
    let containers = globalStructure.containers;
    let sources = globalStructure.sources;
    if (links.length == 0 && containers.length < sources.length &&
        creep.pos.findInRange(containers, 1).length == 0) {
        if (!tasks.withdraw.creep.includes(creep.id)) {
            tasks.withdraw.creep.push(creep.id);
        }
        return false;
    }
    if (!transfer(creep)) {
        return false;
    }
    return true;
}
function transfer(creep) {
    let link = creep.pos.findInRange(globalStructure.fromLinks, 1)[0];
    if (link != undefined) {
        let targetLink = Game.getObjectById(link.id);
        if (creep.transfer(targetLink, RESOURCE_ENERGY) == OK) {
            return true;
        }
        return false;
    }
    let source = globalStructure.sources[creep.memory.sourcesPosition];
    let container = globalStructure.containers.filter(structure => structure.pos.isNearTo(source))[0];
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
    run: function () {
        newCreep();
        for (let i = 0; i < Memory.roles.harvesters.length; ++i) {
            roleHarvester.run(Game.getObjectById(Memory.roles.harvesters[i]));
        }
    }
};
function newCreep() {
    let harvesters = Memory.roles.harvesters;
    let transfers = Memory.roles.transfers;
    let sources = globalStructure.sources;
    Game.spawns['Spawn1'].memory.shouldSpawn = null;
    if (harvesters.length <= transfers.length && harvesters.length < sources.length) {
        Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
        newHarvester(harvesters);
    }
}
function newHarvester(harvesters) {
    let newName = "Harvester" + Game.time;
    let sourcesLength = globalStructure.sources.length;
    let posFlag = 0;
    for (let i = 0; i < sourcesLength; ++i) {
        for (let j = 0; j < harvesters.length; ++j) {
            if (i == Game.getObjectById(harvesters[j]).memory.sourcesPosition) {
                posFlag += 1;
                break;
            }
        }
        if (posFlag == i)
            break;
    }
    if (posFlag >= sourcesLength)
        return;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'), newName, { memory: { role: 'harvester', sourcesPosition: posFlag } });
}

const roleTransfer = {
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
        if (target == null) {
            for (let key in tasks.transfer) {
                if (tasks.transfer[key].includes(task)) {
                    tasks.transfer[key].splice(tasks.transfer[key].indexOf(task), 1);
                    creep.memory.carrierTarget = null;
                    break;
                }
            }
            return;
        }
        let type = target.structureType;
        let res = 0;
        res = creep.transfer(target, RESOURCE_ENERGY);
        switch (res) {
            case OK:
                creep.memory.carrierTarget = null;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, { reusePath: 10 });
                break;
        }
        tasks.transfer[type].splice(tasks.transfer[type].indexOf(task), 1);
        return;
    },
    goWithdraw: function (creep, task) {
        let target = Game.getObjectById(task);
        creep.memory.carrierTarget = task;
        if (target == null) {
            for (let key in tasks.withdraw) {
                if (tasks.withdraw[key].includes(target)) {
                    tasks.withdraw[key].splice(tasks.withdraw[key].indexOf(task), 1);
                    break;
                }
            }
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
                    creep.moveTo(target, { reusePath: 10 });
                    break;
            }
            tasks.withdraw.creep.splice(tasks.withdraw.creep.indexOf(task), 1);
        }
        else {
            let type = target.structureType;
            res = creep.withdraw(target, RESOURCE_ENERGY);
            switch (res) {
                case OK:
                    creep.memory.carrierTarget = null;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, { reusePath: 10 });
                    break;
            }
            tasks.withdraw[type].splice(tasks.withdraw[type].indexOf(task), 1);
        }
        return;
    },
};

const transferTask = {
    run: function () {
        newTransfer();
        let withdrawTask = tasks.returnWithdraw();
        let transferTask = findTransferTask();
        let transferIndex = 0;
        let withdrawIndex = 0;
        for (let i = 0; i < Memory.roles.transfers.length; ++i) {
            let transfer = Game.getObjectById(Memory.roles.transfers[i]);
            if (transfer.memory.carrierTarget != null) {
                if (roleTransfer.isTransfering(transfer)) {
                    roleTransfer.goTransfer(transfer, transfer.memory.carrierTarget);
                }
                else {
                    roleTransfer.goWithdraw(transfer, transfer.memory.carrierTarget);
                }
                continue;
            }
            if (roleTransfer.isTransfering(transfer)) {
                roleTransfer.goTransfer(transfer, transferTask[transferIndex++]);
            }
            else {
                roleTransfer.goWithdraw(transfer, withdrawTask[withdrawIndex++]);
            }
        }
    }
};
function newTransfer() {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let harvesters = Memory.roles.harvesters;
    let transfers = Memory.roles.transfers;
    let sources = globalStructure.sources;
    if (transfers.length >= harvesters.length || transfers.length >= sources.length) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';
    let newName = 'Transfer' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, { memory: {
            role: 'transfer',
        } });
}
function findTransferTask() {
    return tasks.returnTransfer();
}

const roleUpgrader = {
    run: function (creep) {
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
            goGetEnergy$2(creep);
        }
    }
};
function goUpgrade(creep) {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}
function goGetEnergy$2(creep) {
    let targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
            structure.store[RESOURCE_ENERGY] > 0 });
    if (targetContainer == undefined) {
        let target = globalStructure.sources.filter(source => source.energy > 0)[0];
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
    else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetContainer);
    }
}

const upgradeTask = {
    run: function () {
        let upgraders = Memory.roles.upgraders;
        if (Memory.roles.upgraders.length < 1) {
            newUpgrader();
        }
        for (let i = 0; i < upgraders.length; ++i) {
            roleUpgrader.run(Game.getObjectById(upgraders[i]));
        }
    }
};
function newUpgrader() {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'upgrader';
    let newName = 'Upgrader' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('upgrader'), newName, {
        memory: { role: 'upgrader' }
    });
}

const roleBuilder = {
    run: function (creep) {
        if (backRoom$1(creep) == 0) {
            return;
        }
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        else if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }
        if (creep.memory.building) {
            goBuild(creep);
        }
        else {
            goGetEnergy$1(creep);
        }
    }
};
function backRoom$1(creep) {
    if (creep.room != Game.spawns["Spawn1"].room) {
        creep.moveTo(Game.spawns["Spawn1"]);
        return 0;
    }
    else {
        return -1;
    }
}
function goBuild(creep) {
    let target = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (target[0]) {
        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) / 2 &&
            !creep.pos.inRangeTo(target[0], 10)) {
            creep.memory.building = false;
            return;
        }
        if (creep.build(target[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
    }
}
function goGetEnergy$1(creep) {
    let targetStore = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE) &&
                structure.store[RESOURCE_ENERGY] > 0;
        } });
    if (targetStore != null) {
        if (creep.withdraw(targetStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetStore);
        }
        return;
    }
    let sources = globalStructure.sources.filter(source => source.energy > 0);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        if (creep.moveTo(sources[0]) == ERR_NO_PATH) {
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
        }
    }
    return;
}

const buildTask = {
    run: function () {
        let builders = Memory.roles.builders;
        let sites = globalStructure.sites;
        if (sites.length > 0 && builders.length < 1) {
            newBuilder();
        }
        for (let i = 0; i < builders.length; ++i) {
            roleBuilder.run(Game.getObjectById(builders[i]));
        }
    }
};
function newBuilder() {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'builder';
    let newName = 'Builder' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
        memory: { role: 'builder' }
    });
}

const roleRepairer = {
    run: function (creep) {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            global.repairerTarget = null;
        }
        else if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
        }
        if (creep.memory.repairing) {
            goRepair(creep);
            backRoom(creep);
        }
        else {
            goGetEnergy(creep);
        }
    }
};
function backRoom(creep) {
    if (creep.room != Game.spawns["Spawn1"].room) {
        creep.moveTo(Game.spawns["Spawn1"]);
    }
}
function goRepair(creep) {
    if (global.repairerTarget != null &&
        global.repairerTarget.hits < global.repairerTarget.hitsMax) {
        if (Game.getObjectById(global.repairerTarget.id).hits ==
            Game.getObjectById(global.repairerTarget.id).hitsMax) {
            global.repairerTarget = null;
            return;
        }
        if (creep.repair(global.repairerTarget) == ERR_NOT_IN_RANGE) {
            creep.moveTo(global.repairerTarget);
        }
        return;
    }
    let injured = creep.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });
    let targetTo = [];
    if (creep.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_TOWER })[0] == undefined) {
        targetTo = injured.filter(structure => structure.structureType != STRUCTURE_WALL);
    }
    if (targetTo[0] == undefined) {
        targetTo = injured.sort((a, b) => a.hits - b.hits);
    }
    if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) / 2 &&
        !creep.pos.inRangeTo(targetTo[0], 10)) {
        creep.memory.repairing = false;
        global.repairerTarget = null;
        return;
    }
    global.repairerTarget = targetTo[0];
    if (creep.repair(targetTo[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetTo[0]);
    }
}
function goGetEnergy(creep) {
    let targetEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE)
                && structure.store[RESOURCE_ENERGY] > 0;
        } });
    if (targetEnergy == null) {
        let targetsource = globalStructure.sources[0];
        if (creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetsource);
        }
    }
    else {
        if (creep.withdraw(targetEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetEnergy);
        }
    }
}

const repairTask = {
    run: function () {
        let repairers = Memory.roles.repaiers;
        let containers = globalStructure.containers;
        if (repairers.length < 1 && containers.length > 0) {
            newRepairer();
        }
        for (let i = 0; i < repairers.length; ++i) {
            roleRepairer.run(Game.getObjectById(repairers[i]));
        }
    }
};
function newRepairer() {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'repairer';
    let newName = 'Repairer' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
        memory: { role: 'repairer' }
    });
}

// global
const loop = function () {
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    if (Game.spawns.Spawn1 != undefined) {
        // refresh global variable
        if (Game.time % 100 == 0) {
            refreshGlobal();
        }
        // refresh memory
        memoryRefresh.refresh();
        if (Game.spawns.Spawn1 != undefined) {
            // run tasks
            harvestTask.run();
            transferTask.run();
            buildTask.run();
            upgradeTask.run();
            repairTask.run();
            // run structures
            for (let name in Game.structures) {
                let structure = Game.structures[name];
                switch (structure.structureType) {
                    case STRUCTURE_TOWER:
                        structureTower.run(structure);
                        break;
                    case STRUCTURE_LINK:
                        structureLink.run(structure);
                        break;
                }
            }
        }
    }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
