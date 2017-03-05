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
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
            creep.memory.delivering = true;
        }
        
        if(creep.memory.delivering) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            
            if(!target) {
                target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < structure.energyCapacity;
                    }
                });
            }
            
            if(!target && creep.room.terminal) {
                if(creep.room.storage && creep.room.storage.store.energy > 100000) {
                    var terminal = creep.room.terminal;
                    if(_.sum(terminal.store) < terminal.storeCapacity && terminal.store[RESOURCE_ENERGY] < 100000) {
                        target = terminal;
                    }
                }
            }
            
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else if(creep.carry.energy < creep.carryCapacity) {
                creep.memory.delivering = false;
            }
        } else {
            var source = Game.getObjectById(creep.memory.source);
            var result = logistic.obtainEnergy(creep, source, true);
            if(result == logistic.obtainResults.withdrawn) {
                creep.memory.delivering = true;
            }
        }
    }
};