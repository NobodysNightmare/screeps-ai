const movement = require("helper.movement");

module.exports = {
    name: "discoverer",
    parts: [MOVE],
    run: function(creep) {
        if(creep.ticksToLive == CREEP_LIFE_TIME - 1) creep.notifyWhenAttacked(false);

        creep.memory.targets = _.filter(creep.memory.targets, (r) => r !== creep.room.name);

        if(creep.memory.targets.length > 1) {
            movement.moveToRoom(creep, creep.memory.targets[0]);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'discoverer');
