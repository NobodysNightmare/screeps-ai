const spawnHelper = require('helper.spawning');
const boosting = require("helper.boosting");
const logistic = require('helper.logistic');
const movement = require("helper.movement");

module.exports = {
    name: "upgrader",
    partConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    configsForEnergyPerTick: function(energyPerTick) {
        var configs = [];
        for(var workCount = energyPerTick; workCount >= 1; workCount -= 1) {
            configs.push(Array(workCount).fill(WORK).concat([CARRY]).concat(Array(Math.ceil((workCount + 1) / 2)).fill(MOVE)));
        }

        return configs;
    },
    run: function(creep) {
        if(boosting.accept(creep, "XGH2O")) return;

        if(creep.memory.room && creep.room.name !== creep.memory.room) {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        } else if(movement.isOnExit(creep)) {
            movement.leaveExit(creep);
        }

        creep.memory.stopped = true;
        let controller = creep.room.controller;
        if(creep.room.storage && creep.room.storage.store.energy < 10000 && controller.ticksDowngraded() < 1000) {
            return; // strictly conserve energy when supply is very low
        }

        var container = logistic.storeFor(controller);
        if(container && ((container.store && container.store.energy > 0) || container.energy > 0 || creep.store.energy > 0)) {
            var withdrawResult = OK;

            // only really withdraw when the carry is low, because only one
            // creep can withdraw from a container in the same tick. So we ensure
            // that multiple ugraders can do their job simultaneously
            if(creep.store.energy <= _.filter(creep.body, (part) => part.type == WORK).length) {
                withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);
            }

            if(withdrawResult == OK) {
                if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.goTo(controller);
                    creep.memory.stopped = false;
                }
            } else if(withdrawResult == ERR_NOT_IN_RANGE) {
                creep.goTo(container);
                creep.memory.stopped = false;
            }

          return;
        }

        if(creep.memory.upgrading && creep.store.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.store.energy == creep.store.getCapacity()) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.goTo(controller);
                creep.memory.stopped = false;
            }
        }
        else {
            let source = creep.room.controller.pos.findClosestByRange(FIND_SOURCES);
            logistic.obtainEnergy(creep, source);
            creep.memory.stopped = false;
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'upgrader');
