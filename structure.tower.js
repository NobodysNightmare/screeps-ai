const ff = require("helper.friendFoeRecognition");

module.exports = {
    run: function(tower) {
        let friends = tower.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax && creep.memory.role !== "hopper" });
        let warriors = _.filter(friends, (f) => _.some(f.body, (p) => p.type === ATTACK || p.type === RANGED_ATTACK));
        
        if(warriors.length > 0) {
            tower.heal(_.sortBy(warriors, (w) => w.pos.getRangeTo(tower))[0]);
            return;
        }
        
        let hostiles = _.sortBy(ff.findHostiles(tower.room), (h) => h.hits - h.hitsMax);
        if(hostiles.length > 0) {
            tower.attack(hostiles[0]);
            return;
        }
        
        
        if(friends.length > 0) {
            tower.heal(_.sortBy(friends, (f) => f.pos.getRangeTo(tower))[0]);
            return;
        }
        
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.hits < 5000 });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'tower');