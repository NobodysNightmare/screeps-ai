var spawnHelper = require('helper.spawning');
var logistic = require('helper.logistic');

module.exports = {
    name: "harvester",
    carryConfigs: [
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE]
    ],
    miningConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, WORK, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [WORK, WORK, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [WORK, WORK, MOVE, CARRY, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE],
        [WORK, CARRY, MOVE]
    ],
    run: function(creep) {
        // check if our carry  has something else than energy and drop it (e.g. due to overfilling protection)
        let wrongCarryResource = _.find(Object.keys(creep.store), (r) => r != "energy");
        if(wrongCarryResource) {
            creep.drop(wrongCarryResource);
        }

        if(creep.memory.delivering && creep.store.energy == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && creep.store.energy == creep.store.getCapacity()) {
            creep.memory.delivering = true;
        }

        if(creep.store.energy < creep.store.getCapacity() && creep.pos.isNearTo(creep.room.storage)) {
            // Safety valve: protect storage from overflowing with anything but energy
            if(creep.room.storage.my &&(creep.room.storage.store.getFreeCapacity() < 10000)) {
                let excessResource = _.invert(creep.room.storage.store)[_.sortBy(creep.room.storage.store, (r) => -r)[0]];
                console.log("Storage in room " + creep.room.name + " is overfilled! Removing excess " + excessResource);
                creep.withdraw(creep.room.storage, excessResource);
                return;
            }
            creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }

        if(creep.memory.delivering) {
            this.deliver(creep);
        } else {
            if(this.pickup(creep)) this.deliver(creep);
        }
    },
    deliver: function(creep) {
        let targets = this.findTargets(creep);
        let target = targets.shift();
        if(target) {
            creep.memory.stopped = false;
            let transferResult = creep.transfer(target, RESOURCE_ENERGY);
            if(transferResult == ERR_NOT_IN_RANGE) {
                creep.goTo(target, { newPathing: true });
            } else if(transferResult == OK) {
                target = targets.shift();
                if(target && !creep.pos.isNearTo(target)) {
                    creep.goTo(target, { newPathing: true });
                }
            }
        } else {
            creep.memory.stopped = true;
            if(creep.store.energy < creep.store.getCapacity()) {
                creep.memory.delivering = false;
            }
        }
    },
    findTargets: function(creep) {
        var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
        });

        if(targets.length == 0) {
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER &&
                        structure.energy < structure.energyCapacity;
                }
            });
        }

        if(creep.room.storage && creep.room.storage.store.energy > 100000) {
            if(targets.length == 0 && creep.room.terminal) {
                var terminal = creep.room.terminal;
                if(terminal.store.getFreeCapacity() > 0 && terminal.store[RESOURCE_ENERGY] < 100000) {
                    targets = [terminal];
                }
            }

            if(targets.length == 0 && creep.room.ai().mode !== "unclaim") {
                targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_NUKER || structure.structureType == STRUCTURE_POWER_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
                });
            }
        }

        return _.sortBy(targets, (t) => creep.pos.getRangeTo(t));
    },
    pickup: function(creep) {
        creep.memory.stopped = false;
        var source = Game.getObjectById(creep.memory.source);
        var result = logistic.obtainEnergy(creep, source, true);
        if(result == logistic.obtainResults.withdrawn) {
            creep.memory.delivering = true;
            return true;
        }

        return false;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'harvester');
