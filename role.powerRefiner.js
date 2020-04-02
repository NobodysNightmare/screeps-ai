const spawnHelper = require("helper.spawning");

module.exports = {
    name: "powerRefiner",
    parts: spawnHelper.makeParts(20, CARRY, 10, MOVE),
    run: function(creep) {
        if(creep.memory.delivering) {
            this.deliver(creep);
        } else {
            this.pickup(creep);
        }
    },
    deliver: function(creep) {
        let spawner = this.spawner(creep);
        if(creep.store[RESOURCE_POWER]) {
            if(creep.transfer(spawner, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                creep.goTo(spawner);
            }
        } else if(creep.store.energy) {
            let result = creep.transfer(spawner, RESOURCE_ENERGY);
            if(result == OK) {
                creep.memory.delivering = false;
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.goTo(spawner);
            }
        } else {
            creep.memory.delivering = false;
        }
    },
    pickup: function(creep) {
        let spawner = this.spawner(creep);
        let neededPower = (spawner.powerCapacity - spawner.power) - (creep.store[RESOURCE_POWER] || 0);
        neededPower = Math.min(neededPower, creep.store.getCapacity() - _.sum(creep.store), creep.room.storage.store.power || 0);
        if(!creep.store[RESOURCE_POWER] && neededPower > 0) {
            let result = creep.withdraw(creep.room.storage, RESOURCE_POWER, neededPower);
            if(result == ERR_NOT_IN_RANGE) {
                creep.goTo(creep.room.storage);
            }
        } else {
            let result = creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
            if(result == OK || result == ERR_FULL) {
                creep.memory.delivering = true;
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.goTo(creep.room.storage);
            }
        }
    },
    spawner: function(creep) {
        return creep.room.powerSpawn();
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'powerRefiner');
