module.exports = {
    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
            return;
        }
        
        var closestFriendly = tower.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax });
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