var logistic = require('helper.logistic');

module.exports = {
    name: "carrier",
    partConfigs: [
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE]
    ],
    configsForCapacity: function(capacity) {
        var configs = [];
        for(var carries = Math.ceil(capacity / 50); carries >= 2; carries -= 1) {
            configs.push(Array(carries).fill(CARRY).concat(Array(Math.ceil(carries / 2)).fill(MOVE)));
        }
        
        return configs;
    },
    run: function(creep) {
        if(creep.memory.resource == RESOURCE_ENERGY) {
            logistic.pickupSpareEnergy(creep);
        }
        
        if(_.sum(creep.carry) > 0) {
            var target = logistic.storeFor(this.destination(creep));
            if(creep.transfer(target, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            // TODO: also collect raw resources lying around the source
            var target = logistic.storeFor(this.source(creep));
            var result = creep.withdraw(target, creep.memory.resource);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if(result == OK) {
                creep.memory.delivering = true;
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