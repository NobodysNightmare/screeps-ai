const boosting = require("helper.boosting");
const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "healer",
    configs: function(options) {
        var configs = [];
        // TODO: move in front of heal?
        for(var heal = (options.maxHeal || 25); heal >= (options.minHeal || 1); heal -= 1) {
            let config = Array(heal).fill(HEAL).concat(Array(Math.ceil(heal / (options.healRatio || 1))).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    // 6 towers at point blank: 3600 damage / tick
    // 25 heal parts: 300 heal / tick (boosted 1200 heal / tick)
    // boosted tough: 0.3 dmg taken => 4000 heal / tick (effective)
    toughConfig: function(toughness) {
      return spawnHelper.makeParts(toughness, TOUGH, 40 - toughness, HEAL, 10, MOVE);
    },
    run: function(creep) {
        if(creep.ticksToLive == CREEP_LIFE_TIME - 1) creep.notifyWhenAttacked(false);

        if(creep.body[0].type === TOUGH) {
            if(boosting.accept(creep, "XZHO2", "XLHO2", "XGHO2")) return;
        } else {
            if(boosting.accept(creep, "XLHO2")) return;
        }

        let target = Game.creeps[creep.memory.target];
        if(!target || (creep.hits < creep.hitsMax && creep.hits < target.hits)) {
            this.heal(creep, creep);
            if(target) {
                if(creep.pos.isNearTo(target)) {
                    this.moveWhileNearTarget(creep, target);
                } else {
                    if(!creep.memory.avoidRooms || !creep.memory.avoidRooms.includes(target.room.name)) {
                        creep.goTo(target);
                    }
                }
            }
            return;
        }

        if(target) {
            this.heal(creep, target);
        } else {
            this.findNewTarget(creep);
        }
    },
    heal: function(creep, target) {
        let healResult = creep.heal(target);
        if(healResult === OK) {
            this.moveWhileNearTarget(creep, target);
        } else if(healResult == ERR_NOT_IN_RANGE) {
            creep.rangedHeal(target);
            if(!creep.memory.avoidRooms || !creep.memory.avoidRooms.includes(target.room.name)) {
                creep.goTo(target);
            }
        }
    },
    findNewTarget: function(creep) {
        let newTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax });
        if(!newTarget) return;

        creep.memory.target = newTarget.name;
    },
    moveWhileNearTarget: function(creep, target) {
        let exitDir = movement.getExitDirection(target);
        if(exitDir) {
            // Being near, when target is on the exit tile can only happen when
            // the target arrived in this room, when we were already there.
            // Clear the exit to avoid us blocking targets movement off the exit.
            creep.move(movement.inverseDirection(exitDir));
        } else {
            // instantly follow to keep up with target
            creep.move(creep.pos.getDirectionTo(target));
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'healer');
