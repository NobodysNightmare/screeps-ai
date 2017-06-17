const spawnHelper = require("helper.spawning");

module.exports = {
    name: "nukeOperator",
    parts: spawnHelper.makeParts(20, CARRY, 10, MOVE),
    run: function(creep) {
        if(!creep.room.storage || !creep.room.nuker()) {
            console.log("Nuke operator in room " + creep.room.name + " is either missing storage or nuker.");
            return;
        }
        
        if(_.sum(creep.carry) > 0) {
            this.carryToNuker(creep);
        } else {
            this.pickupResource(creep);
        }
    },

    carryToNuker: function(creep) {
        if(creep.pos.isNearTo(creep.room.nuker())) {
            creep.transfer(creep.room.nuker(), _.last(_.keys(creep.carry)));
        } else {
            creep.moveTo(creep.room.nuker());
        }
    },
    
    pickupResource: function(creep) {
        if(creep.pos.isNearTo(creep.room.storage)) {
            let missingEnergy = creep.room.nuker().energyCapacity - creep.room.nuker().energy;
            let missingGhodium = creep.room.nuker().ghodiumCapacity - creep.room.nuker().ghodium;
            let resource = missingGhodium > 0 ? RESOURCE_GHODIUM : RESOURCE_ENERGY;
            if(missingEnergy > 0 || missingGhodium > 0) {
                let amount = Math.min(creep.carryCapacity, creep.room.storage.store[resource], resource === RESOURCE_GHODIUM ? missingGhodium : missingEnergy);
                creep.withdraw(creep.room.storage, resource, amount);
            } else {
                creep.suicide();
            }
        } else {
            creep.moveTo(creep.room.storage);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'nukeOperator');
