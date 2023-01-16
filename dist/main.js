'use strict';

const globalStructure = {
    sources: Object.values(Game.rooms)[0].find(FIND_SOURCES),
    structures: Object.values(Game.rooms)[0].find(FIND_STRUCTURES),
    containers: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_CONTAINER }),
    links: Object.values(Game.rooms)[0].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_LINK }),
    fromLinks: [],
    toLinks: [],
    refresh: function () {
        globalStructure.structures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);
        globalStructure.containers = globalStructure.structures.filter(structure => structure.structureType == STRUCTURE_CONTAINER);
        globalStructure.links = globalStructure.structures.filter(structure => structure.structureType == STRUCTURE_LINK);
        this.fromLinks = [];
        this.toLinks = [];
        for (let i = 0; i < globalStructure.links.length; ++i) {
            if (this.links[i].pos.findInRange(this.sources, 3)[0] != undefined) {
                this.fromLinks.push(this.links[i]);
            }
            else {
                this.toLinks.push(this.links[i]);
            }
        }
    }
};

// harvester
global.harvestPath = [];
// repairer
global.repairerTarget = null;

/**
 * @file to refresh global veriables
 * @author LazyKitty
 */
const refreshGlobal = function () {
    // GlobalStructure.ts
    if (Game.spawns.Spawn1 != undefined) {
        globalStructure.refresh();
    }
    // GlobalRole.ts
    // harvester
    global.harvestPath = [];
    // repairer
    global.repairerTarget = null;
};

const newCreepBody = function (role) {
    // MOVE 50,WORK 100,CARRY 50,ATTACK 80,RANGED_ATTACK 150,HEAL 250,CLAIM 600,TOUGH 10
    let capacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
    if (capacity == 300 || Object.getOwnPropertyNames(Memory.creeps).length < 7) {
        switch (role) {
            case 'harvester': return [WORK, CARRY, MOVE, MOVE];
            case 'upgrader': return [WORK, CARRY, MOVE, MOVE];
            case 'builder': return [WORK, CARRY, MOVE, MOVE];
            case 'transfer': return [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            case 'repairer': return [WORK, CARRY, MOVE, MOVE];
        }
    }
    else {
        switch (role) {
            case 'harvester': {
                let bodys = [];
                for (capacity /= 50; capacity >= 5; capacity -= 5) {
                    bodys.push(WORK, WORK, MOVE);
                    if (bodys.length == 9)
                        break;
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

const newCreeps = {
    /**
     *
     * @returns { number } 0 | -1
     * @author LazyKitty
     */
    run: function () {
        // delete dead creeps's memory
        deleteDead();
        if (Game.spawns.Spawn1.room.energyAvailable < 200) {
            return 0;
        }
        // if harvesters less than sources, create it
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        let sourcesLength = globalStructure.sources.length;
        if (harvesters.length < sourcesLength) {
            newHarvester(harvesters, sourcesLength);
            return 0;
        }
        // if builders less than 1 and sites exist, creat it
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        let sites = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length != 0 && builders.length < 1) {
            newBuilder();
            return 0;
        }
        // if upgrader less than 1, creat it
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        let storageEnergy = Game.spawns.Spawn1.room.storage.store[RESOURCE_ENERGY];
        let upgradersNum = sites.length > 0 && storageEnergy < 100000 ? 1 : 2;
        if (upgraders.length < upgradersNum) {
            newUpgrader();
            return 0;
        }
        // if transfers less than sources's length * 2, creat it
        // if link exist, transfer's number equal sources's length
        let transfers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
        let transferNum = globalStructure.links[0] == undefined ? sourcesLength : sourcesLength * 2;
        if (globalStructure.containers.length > 1 && transfers.length < transferNum) {
            newTransfer(transfers, sourcesLength);
            return 0;
        }
        // if repairer less than 1, creat it
        let repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        if (globalStructure.containers.length > 1 && repairer.length < 1) {
            newRepairer();
            return 0;
        }
        return -1;
    }
};
function deleteDead() {
    // delete dead creeps
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}
function newHarvester(harvesters, sourcesLength) {
    let newName = 'Harvester' + Game.time;
    let posFlag = 0;
    for (let i = 0; i < sourcesLength; ++i) {
        for (let j = 0; j < harvesters.length; ++j) {
            if (i == harvesters[j].memory.sourcesPosition) {
                posFlag += 1;
                break;
            }
        }
        if (posFlag == i)
            break;
    }
    if (posFlag >= sourcesLength)
        return;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('harvester'), newName, {
        memory: { role: 'harvester', sourcesPosition: posFlag }
    });
}
function newUpgrader() {
    let newName = 'Upgrader' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('upgrader'), newName, {
        memory: { role: 'upgrader' }
    });
}
function newBuilder() {
    let newName = 'Builder' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('builder'), newName, {
        memory: { role: 'builder' }
    });
}
function newTransfer(transfer, sourcesLength) {
    let newName = 'Transfer' + Game.time;
    let posFlag = 0;
    let temp = 0;
    let transferNum = globalStructure.links[0] == undefined ? 1 : 2;
    for (let i = 0; i < sourcesLength; ++i) {
        for (let j = 0; j < transfer.length; ++j) {
            if (transfer[j].memory.sourcesPosition == i) {
                temp += 1;
                if (temp == transferNum) {
                    posFlag += 1;
                    temp = 0;
                    break;
                }
            }
        }
        if (posFlag == i)
            break;
    }
    if (posFlag >= sourcesLength)
        return;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('transfer'), newName, { memory: {
            role: 'transfer',
            sourcesPosition: posFlag,
        } });
}
function newRepairer() {
    let newName = 'Repairer' + Game.time;
    Game.spawns['Spawn1'].spawnCreep(newCreepBody('repairer'), newName, {
        memory: { role: 'repairer' }
    });
}

const roleAttacker = {
    run: function (creep) {
        // let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
        // if (enemy[0] == undefined) {
        //   return;
        // } else {
        //   goAttack(creep, enemy);
        // }
        if (creep.pos.roomName != creep.memory.room) {
            let pos = Game.flags.Flag1.pos;
            if (creep.moveTo(pos) == ERR_NO_PATH) {
                let target = creep.pos.findClosestByPath(FIND_STRUCTURES);
                creep.attack(target);
            }
            /* creep.moveTo(Game.getObjectById('63b529848d21f8ad5fe698c6').pos);
            creep.attack(Game.getObjectById('63b529848d21f8ad5fe698c6')); */
            return;
        }
        let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
        if (enemy[0] == undefined) {
            enemy = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER });
            if (enemy[0] == undefined) {
                return;
            }
            goAttack$1(creep, enemy);
        }
        else {
            goAttack$1(creep, enemy);
        }
    }
};
function goAttack$1(creep, enemy) {
    let target = creep.pos.findClosestByPath(enemy);
    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
}

const roleBuilder = {
    run: function (creep) {
        if (backRoom$3(creep) == 0) {
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
            goGetEnergy$2(creep);
        }
    }
};
function backRoom$3(creep) {
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
function goGetEnergy$2(creep) {
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

const roleClaimer = {
    run: function (creep) {
        let pos = new RoomPosition(1, 1, 'W59S26');
        if (creep.pos.roomName != pos.roomName) {
            creep.moveTo(pos.x, pos.y);
            return;
        }
        if (creep.room.controller) {
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};

const roleHarvester = {
    run: function (creep) {
        // if harvester went into the wrong room
        if (backRoom$2(creep) == 0) {
            return;
        }
        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = true;
        }
        else if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }
        // if harvester's free capacity more than 0, harvest energy
        if (creep.memory.harvesting) {
            goHarvest(creep);
        }
        else {
            transferEnergy(creep);
        }
        if (creep.ticksToLive <= 30 && !creep.memory.dying) {
            newOne(creep);
        }
    }
};
function backRoom$2(creep) {
    if (creep.room != Game.spawns["Spawn1"].room) {
        creep.moveTo(Game.spawns["Spawn1"]);
        return 0;
    }
    else {
        return -1;
    }
}
function goHarvest(creep) {
    let targetSource = globalStructure.sources[creep.memory.sourcesPosition];
    if (targetSource.energy == 0)
        return;
    let container = globalStructure.containers.filter(structure => structure.pos.isNearTo(targetSource));
    if (container[0] != undefined) {
        if (container[0].store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
            creep.getActiveBodyparts(CARRY) == 0) {
            return;
        }
        if (!creep.pos.isEqualTo(container[0]) &&
            creep.pos.isNearTo(targetSource)) {
            creep.moveTo(container[0]);
            return;
        }
    }
    if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
        if (global.harvestPath[creep.memory.sourcesPosition] == undefined) {
            global.harvestPath[creep.memory.sourcesPosition] = creep.room.findPath(creep.pos, targetSource.pos);
        }
        creep.moveByPath(global.harvestPath[creep.memory.sourcesPosition]);
    }
}
function transferEnergy(creep) {
    let source = globalStructure.sources[creep.memory.sourcesPosition];
    if (globalStructure.links[0] != undefined && creep.getActiveBodyparts(CARRY) >= 1) {
        let link = creep.pos.findInRange(globalStructure.fromLinks, 3).filter(link => link.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        if (link[0] != undefined) {
            if (creep.transfer(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link[0]);
            }
            return;
        }
    }
    // let container: StructureContainer = source.pos.findClosestByPath(FIND_STRUCTURES, {
    //   filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
    // });
    let container = source.pos.findInRange(globalStructure.containers, 1)[0];
    if (container != undefined && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
        }
        return;
    }
    let structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_STORAGE ||
                structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER)
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    let transferTo = structures.filter(structure => structure.structureType == STRUCTURE_EXTENSION);
    let target;
    if (transferTo[0] == undefined) {
        target = creep.pos.findClosestByPath(structures);
    }
    else {
        target = creep.pos.findClosestByPath(transferTo);
    }
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
}
function newOne(creep) {
    let spawns = creep.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN });
    let newName = 'Harvester' + Game.time;
    let error = Game.spawns[spawns[0].name].spawnCreep(newCreepBody('harvester'), newName, { memory: { role: 'harvester', sourcesPosition: creep.memory.sourcesPosition } });
    if (error == OK) {
        creep.memory.dying = true;
    }
}

const roleHealer = {
    run: function (creep) {
        let injured = creep.pos.findClosestByPath(FIND_MY_CREEPS, { filter: (creeps) => creeps.hits < creeps.hitsMax && creeps.room == creep.room });
        if (injured == undefined) {
            let enemy = creep.room.find(FIND_HOSTILE_CREEPS);
            if (enemy[0] == undefined) {
                return;
            }
            else {
                let attacker = creep.pos.findClosestByPath(FIND_MY_CREEPS, { filter: (creeps) => creeps.memory.role == 'attacker' });
                creep.moveTo(attacker);
            }
        }
        else {
            if (creep.heal(injured) == ERR_NOT_IN_RANGE) {
                creep.moveTo(injured);
            }
        }
    }
};

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
            backRoom$1(creep);
        }
        else {
            goGetEnergy$1(creep);
        }
    }
};
function backRoom$1(creep) {
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
    let targetTo;
    if (creep.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_TOWER })[0] != undefined) {
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
function goGetEnergy$1(creep) {
    let targetEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE)
                && structure.store[RESOURCE_ENERGY] > 0;
        } });
    if (targetEnergy == null) {
        let targetsource = creep.pos.findClosestByPath(FIND_SOURCES);
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

const roleTransfer = {
    run: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }
        if (backRoom(creep) == 0) {
            return;
        }
        if (creep.memory.transfering) {
            goTransfer(creep);
        }
        else {
            goWithdraw(creep);
        }
    }
};
function backRoom(creep) {
    if (creep.room != Game.spawns["Spawn1"].room) {
        creep.moveTo(Game.spawns["Spawn1"]);
        return 0;
    }
    else {
        return -1;
    }
}
function goTransfer(creep) {
    let structures = creep.room.find(FIND_STRUCTURES);
    let target = structures.filter(structure => (structure.structureType == STRUCTURE_EXTENSION ||
        structure.structureType == STRUCTURE_SPAWN) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    if (target[0] != undefined) {
        let temp = creep.pos.findInRange(target, 3)[0];
        if (temp != undefined) {
            target[0] = temp;
        }
        if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target[0]);
        }
        return;
    }
    target = structures.filter(structure => (structure.structureType == STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    if (target[0] != undefined) {
        let temp = creep.pos.findInRange(target, 6)[0];
        if (temp != undefined) {
            target[0] = temp;
        }
        if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target[0]);
        }
        return;
    }
    target = structures.filter(structure => ((structure.structureType == STRUCTURE_CONTAINER &&
        structure.pos.isNearTo(structure.pos.findClosestByPath(FIND_SOURCES)) == false) ||
        structure.structureType == STRUCTURE_STORAGE) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]);
    if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target[0]);
    }
}
function goWithdraw(creep) {
    let targetSource = globalStructure.sources[creep.memory.sourcesPosition];
    let targetContainer = targetSource.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER) });
    if (targetContainer == null ||
        targetContainer.store[RESOURCE_ENERGY] <= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE) &&
                structure.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
        });
    }
    if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetContainer);
    }
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
            isNearToTarget(creep);
            goUpgrade(creep);
        }
        else {
            goGetEnergy(creep);
        }
    }
};
function goUpgrade(creep) {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}
function goGetEnergy(creep) {
    let targetContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
            structure.store[RESOURCE_ENERGY] > 0 });
    if (targetContainer == undefined) {
        let target = creep.pos.findClosestByPath(FIND_SOURCES, { filter: (sources) => sources.energy > 0 });
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
    else if (creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetContainer);
    }
}
function isNearToTarget(creep) {
    let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
    if (creep.pos.isNearTo(closestSource)) {
        creep.moveTo(creep.room.controller);
    }
}

const structureLink = {
    run: function (link) {
        if (globalStructure.fromLinks.includes(link)) {
            transfer(link);
        }
    }
};
function transfer(link) {
    if (link.store[RESOURCE_ENERGY] >= 100) {
        for (let i = 0; i < globalStructure.toLinks.length; ++i) {
            let energy = globalStructure.toLinks[i].store.getFreeCapacity(RESOURCE_ENERGY);
            if (energy > 10) {
                link.transferEnergy(globalStructure.toLinks[0]);
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
    let target = tower.pos.findClosestByPath(enemy);
    tower.attack(target);
}
function runRepair(tower) {
    let targetTo = tower.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax &&
            object.structureType != STRUCTURE_WALL
    });
    tower.repair(targetTo[0]);
}

// global
const loop = function () {
    if (Game.spawns.Spawn1 != undefined) {
        // refresh global variable
        if (Game.time % 100 == 0) {
            refreshGlobal();
        }
        if (Game.spawns.Spawn1 != undefined) {
            // create new creeps
            newCreeps.run();
            // run creeps
            for (let name in Game.creeps) {
                let creep = Game.creeps[name];
                switch (creep.memory.role) {
                    case 'harvester':
                        roleHarvester.run(creep);
                        break;
                    case 'upgrader':
                        roleUpgrader.run(creep);
                        break;
                    case 'builder':
                        roleBuilder.run(creep);
                        break;
                    case 'transfer':
                        roleTransfer.run(creep);
                        break;
                    case 'repairer':
                        roleRepairer.run(creep);
                        break;
                    case 'attacker':
                        roleAttacker.run(creep);
                        break;
                    case 'healer':
                        roleHealer.run(creep);
                        break;
                    case 'claimer':
                        roleClaimer.run(creep);
                        break;
                }
            }
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
