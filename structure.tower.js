const ff = require("helper.friendFoeRecognition");

module.exports = {
    run: function(tower) {
        var closestHostile = ff.findClosestHostileByRange(tower.pos);
        if(closestHostile) {
            tower.attack(closestHostile);
            return;
        }
        
        var closestFriendly = tower.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax && creep.memory.role !== "hopper" });
        if(closestFriendly) {
            tower.heal(closestFriendly);
            return;
        }
        
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.hits < 5000 });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'tower');