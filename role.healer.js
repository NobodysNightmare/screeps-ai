const movement = require("helper.movement");

module.exports = {
    name: "healer",
    configs: [
        [HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE]
    ],
    configs: function(options) {
        var configs = [];
        for(var heal = (options.maxHeal || 25); heal >= (options.minHeal || 1); heal -= 1) {
            let config = Array(heal).fill(HEAL).concat(Array(Math.ceil(heal / (options.healRatio || 1))).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
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

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'healer');
