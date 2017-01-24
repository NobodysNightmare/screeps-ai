var logistic = require('helper.logistic');

module.exports = {
    name: "carrier",
    partConfigs: [
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        // TODO: determine when to spawn it (and configure it correctly upon spawning)
        // TODO: initialize with source, destination and resource
        return false;
    },
    run: function(creep) {
        if(creep.memory.delivering && _.sum(creep.carry) == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.delivering = true;
        }

        if(creep.memory.delivering) {
            var target = logistic.storeFor(this.destination(creep));
            if(creep.transfer(target, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            // TODO: also collect raw resources lying around the source
            var target = logistic.storeFor(this.source(creep));
            if(creep.withdraw(target, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    },
    source: function(creep) {
      return Game.getObjectById(creep.memory.source);
    },
    destination: function(creep) {
      return Game.getObjectById(creep.memory.destination);
    }
};