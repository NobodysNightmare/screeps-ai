const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "powerFarmer",
    parts: spawnHelper.makeParts(20, MOVE, 20, ATTACK),
    run: function(creep) {
        if(creep.room.name !== creep.memory.target) {
            movement.moveToRoom(creep, creep.memory.target);
            return;
        }

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES,
            { filter: (s) => s.structureType == STRUCTURE_POWER_BANK });

        if(target) {
            this.attackBank(creep, target);
        } else {
            this.clearPath(creep);
        }
    },
    attackBank: function(creep, target) {
        let returnDamage = POWER_BANK_HIT_BACK * ATTACK_POWER * creep.getActiveBodyparts(ATTACK);

        if(returnDamage >= creep.hits) return;

        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.goTo(target);
        }
    },
    clearPath: function(creep) {
        let resources = creep.room.find(FIND_DROPPED_RESOURCES);
        if(resources.length === 0) return;
        creep.fleeFrom(resources, 4);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'powerFarmer');
