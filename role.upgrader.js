var spawnHelper = require('helper.spawning');
var logistic = require('helper.logistic');

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
        var controller = creep.room.controller;
        var container = logistic.storeFor(controller);
        if(container && ((container.store && container.store.energy > 0) || container.energy > 0 || creep.carry.energy > 0)) {
            var withdrawResult = OK;
            
            // only really withdraw when the carry is low, because only one
            // creep can withdraw from a container in the same tick. So we ensure
            // that multiple ugraders can do their job simultaneously
            if(creep.carry.energy <= _.filter(creep.body, (part) => part.type == WORK).length) {
                withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);
            }
            
            if(withdrawResult == OK) {
                if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            } else if(withdrawResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
          
          return;
        }
        
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            // move to the controller at least once to make room on the source
            creep.moveTo(controller);
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
        else {
            var source = controller.pos.findClosestByRange(FIND_SOURCES);
            logistic.obtainEnergy(creep, source);
        }
    }
};