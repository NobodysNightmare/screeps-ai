var spawnHelper = require('helper.spawning');
var logistic = require('helper.logistic');

module.exports = {
    name: "miner",
    partConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        var room = spawn.room
        return room.controller.level >= 6 &&
            spawnHelper.numberOfCreeps(room, this.name) == 0 &&
            room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length > 0 &&
            room.find(FIND_MINERALS)[0].mineralAmount > 0;
    },
    chooseParts: function(room) {
        return spawnHelper.bestAvailableParts(room, this.partConfigs);
    },
    run: function(creep) {
        // spawning: initialize with target and resource
        var target = Game.getObjectById(creep.memory.target);
        var store = logistic.storeFor(target);
        var harvestResult = OK;
        if(_.sum(creep.carry) < creep.carryCapacity) {
            harvestResult = creep.harvest(target);
        }
        
        if(harvestResult == OK) {
            if(creep.transfer(store, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(store);
            }
        } else if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};