const spawnHelper = require("helper.spawning");

module.exports = {
    name: "reloader",
    parts: spawnHelper.makeParts(12, CARRY, 6, MOVE),
    run: function(creep) {
        if(!creep.room.storage) {
            return;
        }

        if(_.sum(creep.store) > 0) {
            this.carryToTower(creep);
        } else {
            this.pickupResource(creep);
        }
    },

    carryToTower: function(creep) {
        // withdraw when passing by
        if(creep.store.energy < creep.store.getCapacity() && creep.pos.isNearTo(creep.room.storage)) {
            creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }

        let towers = _.sortBy(_.sortBy(creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 }), (s) => s.pos.getRangeTo(creep)), (s) => s.energy);
        let target = towers[0];
        if(!target) return;
        if(creep.pos.isNearTo(target)) {
            creep.transfer(target, RESOURCE_ENERGY);
        } else {
            creep.goTo(target);
        }
    },

    pickupResource: function(creep) {
        if(creep.pos.isNearTo(creep.room.storage)) {
            creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        } else {
            creep.goTo(creep.room.storage);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'reloader');
