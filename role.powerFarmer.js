const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "powerFarmer",
    parts: spawnHelper.makeParts(20, MOVE, 20, ATTACK),
    run: function(creep) {
        if(creep.room.name !== creep.memory.target) {
            movement.moveToRoom(creep, creep.memory.target);
        }

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES,
            { filter: (s) => s.structureType == STRUCTURE_POWER_BANK });

        if(!target) return;

        let returnDamage = POWER_BANK_HIT_BACK * ATTACK_POWER * creep.getActiveBodyparts(ATTACK);

        if(returnDamage >= creep.hits) return;

        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'powerFarmer');