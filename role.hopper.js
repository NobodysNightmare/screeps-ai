const movement = require("helper.movement");

// Hop into a room to take some damage, but go out before it is too late
// Goal is to drain energy out of the room using hostile towers
module.exports = {
    name: "hopper",
    configs: function() {
        var configs = [];
        for(var toughness = 25; toughness >= 10; toughness -= 1) {
            let config = Array(toughness).fill(TOUGH).concat(Array(toughness).fill(MOVE));
            configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        if(creep.ticksToLive == CREEP_LIFE_TIME - 1) creep.notifyWhenAttacked(false);

        let targetName = creep.memory.room;
        if(creep.room.name !== targetName) {
            if(creep.hits == creep.hitsMax) {
                movement.moveToRoom(creep, targetName);
            } else {
                movement.leaveExit(creep);
            }
        } else {
            let damageTaken = creep.memory.lastHits - creep.hits;
            if(creep.hits <= damageTaken * 3) {
                this.moveOut(creep);
            } else {
                movement.leaveExit(creep);
            }
        }
        creep.memory.lastHits = creep.hits;
    },
    moveOut: function(creep) {
        if(creep.pos.x == 1) {
            creep.move(LEFT);
        } else if(creep.pos.x == 48) {
            creep.move(RIGHT);
        } else if(creep.pos.y == 1) {
            creep.move(TOP);
        } else if(creep.pos.y == 48) {
            creep.move(BOTTOM);
        } else {
            // creep somehow got deeper than expected
            creep.move(creep.pos.getDirectionTo(creep.pos.findClosestByRange(FIND_EXIT)));
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'hopper');
