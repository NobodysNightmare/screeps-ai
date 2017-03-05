const movement = require("helper.movement");

module.exports = {
    name: "healer",
    configs: [
        [HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE]
    ],
    run: function(creep) {
        if(creep.hits < creep.hitsMax) {
            this.heal(creep, creep);
            return;
        }
        
        var target = Game.creeps[creep.memory.target];
        if(target) {
            this.heal(creep, target);
        } else {
            this.findNewTarget(creep);
        }
    },
    heal: function(creep, target) {
        if(creep.heal(target) == ERR_NOT_IN_RANGE) {
            let friendlyTerritory = !target.room.controller || target.room.controller.my;
            if(!creep.memory.avoidHostileRooms || (friendlyTerritory && !movement.isOnExit(target))) {
                creep.moveTo(target);
            }
        }
    },
    findNewTarget: function(creep) {
        let newTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax });
        if(!newTarget) return;
        
        creep.memory.target = newTarget.name;
    }
};