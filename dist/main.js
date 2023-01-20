'use strict';

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
            // Id<Creep>[]
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
        claimer: [],
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
        Memory.rooms = {};
        for (let name in Game.rooms) {
            let structures = Game.rooms[name].find(FIND_STRUCTURES);
            Memory.rooms[name] = {
                // Id<Source>[]
                sources: Game.rooms[name].find(FIND_SOURCES).map(source => source.id),
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

const memoryRefresh = {
    refresh: function () {
        memoryRoom.refresh();
        memoryDelete.deleteDead();
        memoryRoles.refresh();
    }
};

const structureLink = {
    run: function (link, room) {
        for (let i = 0; i < room.fromLinks.length; ++i) {
            if (room.fromLinks[i] == link.id) {
                transfer$1(link, room);
                break;
            }
        }
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
            object.structureType != STRUCTURE_WALL &&
            object.structureType != STRUCTURE_RAMPART
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
    returnTransfer: function (room) {
        findTransferTask(room);
        let task = [];
        for (let key in tasks.transfer) {
            task = task.concat(tasks.transfer[key]);
        }
        return task;
    },
    returnWithdraw: function (room) {
        findWithdraw(room);
        let task = [];
        for (let key in tasks.withdraw) {
            task = task.concat(tasks.withdraw[key]);
        }
        return task;
    },
};
function findWithdraw(room) {
    linkTask('withdraw', room);
    containerTask('withdraw', room);
    storageTask('withdraw', room);
}
function findTransferTask(room) {
    transferTask$1('spawn', room);
    transferTask$1('extension', room);
    transferTask$1('tower', room);
    transferTask$1('container', room);
    transferTask$1('storage', room);
}
function transferTask$1(type, room) {
    let targets = room.structures.filter(structure => Game.getObjectById(structure).structureType == type &&
        Game.getObjectById(structure).store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    for (let i = 0; i < targets.length; ++i) {
        if (!tasks.transfer[type].includes(targets[i]) &&
            Game.getObjectById(targets[i]).pos.findInRange(FIND_SOURCES, 2).length == 0) {
            tasks.transfer[type].push(targets[i]);
        }
    }
}
function linkTask(task, room) {
    switch (task) {
        case 'withdraw': {
            let links = room.toLinks;
            for (let i = 0; i < room.toLinks.length; ++i) {
                let link = Game.getObjectById(links[i]);
                if (link.store[RESOURCE_ENERGY] > 100 && !tasks.withdraw.link.includes(link.id)) {
                    tasks.withdraw.link.push(link.id);
                }
            }
            break;
        }
    }
}
function containerTask(task, room) {
    switch (task) {
        case 'withdraw': {
            let containers = room.containers;
            for (let i = 0; i < containers.length; ++i) {
                if (Game.getObjectById(containers[i]).pos.findInRange(FIND_SOURCES, 1).length != 0) {
                    let container = Game.getObjectById(containers[i]);
                    if (container.store[RESOURCE_ENERGY] >= 50 && !tasks.withdraw.container.includes(container.id)) {
                        tasks.withdraw.container.push(container.id);
                    }
                }
            }
            break;
        }
    }
}
function storageTask(task, room) {
    switch (task) {
        case 'withdraw': {
            let storage = Game.getObjectById(room.storage);
            if (storage != undefined && !tasks.withdraw.storage.includes(storage.id) &&
                storage.store[RESOURCE_ENERGY] >= 0) {
                tasks.withdraw.storage.push(storage.id);
            }
            break;
        }
    }
}

const roleHarvester = {
    run: function (creep, room) {
        let transfered = false;
        // avoid wasteing
        if (creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK) * 2) {
            transfered = transferEnergy(creep, room);
        }
        goHarvest(creep, transfered, room);
    }
};
function goHarvest(creep, transfered, room) {
    let source = Game.getObjectById(room.sources[creep.memory.sourcesPosition]);
    if (!creep.pos.isNearTo(source)) {
        creep.moveTo(source);
        return;
    }
    if (source.energy == 0 ||
        creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && !transfered) {
        return;
    }
    let container = source.pos.findInRange(FIND_STRUCTURES, 1).
        filter(structure => structure.structureType == STRUCTURE_CONTAINER);
    if (container[0] != undefined) {
        if (!creep.pos.isEqualTo(container[0])) {
            creep.moveTo(container[0]);
        }
    }
    creep.harvest(source);
}
function transferEnergy(creep, room) {
    if (Game.getObjectById(creep.memory.waiting) != null) {
        return;
    }
    let links = room.links;
    let containers = room.containers;
    let sources = room.sources;
    if (links.length == 0 && containers.length < sources.length &&
        creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure => structure.structureType == STRUCTURE_CONTAINER).length == 0) {
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
    let link = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure => structure.structureType == STRUCTURE_LINK)[0];
    if (link != undefined) {
        let targetLink = Game.getObjectById(link.id);
        if (creep.transfer(targetLink, RESOURCE_ENERGY) == OK) {
            return true;
        }
        return false;
    }
    let container = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure => structure.structureType == STRUCTURE_CONTAINER)[0];
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
            roleHarvester.run(Game.getObjectById(Memory.roles.harvesters[i]), room);
        }
    }
};
function newCreep(room) {
    let harvesters = Memory.roles.harvesters;
    let transfers = Memory.roles.transfers;
    let sources = room.sources;
    Game.spawns['Spawn1'].memory.shouldSpawn = null;
    if (harvesters.length <= transfers.length && harvesters.length < sources.length) {
        Game.spawns['Spawn1'].memory.shouldSpawn = 'harvester';
        newHarvester(harvesters, sources.length);
    }
}
function newHarvester(harvesters, sourcesLength) {
    let newName = "Harvester" + Game.time;
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
        if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            for (let key in tasks.transfer) {
                if (tasks.transfer[key].includes(task)) {
                    tasks.transfer[key].splice(tasks.transfer[key].indexOf(task), 1);
                    break;
                }
            }
            creep.memory.carrierTarget = null;
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
                creep.moveTo(target);
                break;
        }
        tasks.transfer[type].splice(tasks.transfer[type].indexOf(task), 1);
        return;
    },
    goWithdraw: function (creep, task) {
        let target = Game.getObjectById(task);
        creep.memory.carrierTarget = task;
        if (target == null || target.store[RESOURCE_ENERGY] == 0) {
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
                    creep.moveTo(target);
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
                    creep.moveTo(target);
                    break;
            }
            tasks.withdraw[type].splice(tasks.withdraw[type].indexOf(task), 1);
        }
        return;
    },
};

const transferTask = {
    run: function (room) {
        newTransfer(room);
        let withdrawTask = tasks.returnWithdraw(room);
        let transferTask = tasks.returnTransfer(room);
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
function newTransfer(room) {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    let harvesters = Memory.roles.harvesters;
    let transfers = Memory.roles.transfers;
    let sources = room.sources;
    let transferNum = room.links.length > 0 ? sources.length * 2 : sources.length;
    if (transfers.length >= harvesters.length && transfers.length >= transferNum) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'transfer';
    let newName = 'Transfer' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, { memory: {
            role: 'transfer',
        } });
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
        creep.moveTo(creep.room.controller);
    }
}
function goGetEnergy$2(creep, room) {
    let targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
            structure.store[RESOURCE_ENERGY] > 0 });
    if (targetContainer == undefined) {
        let target = Game.getObjectById(room.sources[0]);
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
    else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetContainer);
    }
}

const upgradeTask = {
    run: function (room) {
        let upgraders = Memory.roles.upgraders;
        let upgradersNum = room.sites.length > 0 ? 1 : 3;
        if (Memory.roles.upgraders.length < upgradersNum) {
            newUpgrader();
        }
        for (let i = 0; i < upgraders.length; ++i) {
            roleUpgrader.run(Game.getObjectById(upgraders[i]), room);
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
    run: function (creep, room) {
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
            goGetEnergy$1(creep, room);
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
function goBuild(creep, room) {
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
function goGetEnergy$1(creep, room) {
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
    let sources = Game.getObjectById(room.sources[0]);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        if (creep.moveTo(sources[0]) == ERR_NO_PATH) {
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
        }
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
            goRepair(creep);
            backRoom(creep);
        }
        else {
            goGetEnergy(creep, room);
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
function goGetEnergy(creep, room) {
    let targetEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE)
                && structure.store[RESOURCE_ENERGY] > 0;
        } });
    if (targetEnergy == null) {
        let targetsource = Game.getObjectById(room.sources[0]);
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

const buildTask = {
    run: function (room) {
        let builders = Memory.roles.builders;
        let sites = room.sites;
        if (sites.length > 0 && builders.length < 3) {
            newBuilder();
        }
        for (let i = 0; i < builders.length; ++i) {
            if (sites.length == 0) {
                roleRepairer.run(Game.getObjectById(builders[i]), room);
            }
            else {
                roleBuilder.run(Game.getObjectById(builders[i]), room);
            }
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

const repairTask = {
    run: function (room) {
        let repairers = Memory.roles.repaiers;
        let containers = room.containers;
        if (repairers.length < 1 && containers.length > 0) {
            newRepairer();
        }
        for (let i = 0; i < repairers.length; ++i) {
            roleRepairer.run(Game.getObjectById(repairers[i]), room);
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

const roleClaimer = {
    run: function (creep, flagName) {
        let flag = Game.flags[flagName];
        if (creep.pos.roomName != flag.room.name) {
            creep.moveTo(flag.pos.x, flag.pos.y);
            return;
        }
        if (creep.room.controller) {
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};

const claimTask = {
    run: function (room) {
        let pos = new RoomPosition(1, 1, room);
        if (Game.rooms[pos.roomName] != undefined &&
            Game.rooms[pos.roomName].find(FIND_STRUCTURES).filter(structure => structure.structureType == STRUCTURE_SPAWN).length > 0) {
            Game.flags.claim.remove();
            return;
        }
        if (Game.flags.claim == undefined) {
            Game.flags.claim.setPosition(Game.rooms[pos.roomName].controller.pos);
        }
        if (Game.flags.claim.room.controller.owner.username == null) {
            newClaimer();
            for (let i = 0; i < Memory.roles.claimers.length; ++i) {
                roleClaimer.run(Game.getObjectById(Memory.roles.claimers[i]), 'claim');
            }
        }
        else if (Game.flags.claim.room.controller.owner.username == 'LazyKitty') {
            buildTask.run(Memory.rooms[Game.flags.claim.room.name]);
        }
    }
};
function newClaimer() {
    if (Game.spawns['Spawn1'].memory.shouldSpawn != null) {
        return;
    }
    if (Memory.roles.claimers.length > 0) {
        return;
    }
    Game.spawns['Spawn1'].memory.shouldSpawn = 'claimer';
    let newName = 'claimer' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('claimer'), newName, { memory: { role: 'harvester' } });
}

// MyMemory
const loop = function () {
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    if (Game.spawns.Spawn1 != undefined) {
        // refresh memory
        if (Game.time % 10 == 0) {
            memoryRefresh.refresh();
        }
        for (let name in Memory.rooms) {
            let room = Memory.rooms[name];
            // run tasks
            harvestTask.run(room);
            transferTask.run(room);
            buildTask.run(room);
            upgradeTask.run(room);
            repairTask.run(room);
            claimTask.run('W59S26');
            // run structures
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
    }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
