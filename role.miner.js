var logistic = require('helper.logistic');

module.exports = {
    name: "miner",
    energyConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    mineralConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    run: function(creep) {
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