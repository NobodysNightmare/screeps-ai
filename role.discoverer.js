const movement = require("helper.movement");

module.exports = {
    name: "discoverer",
    parts: [MOVE],
    run: function(creep) {
        if(creep.room.name === creep.memory.targets[0]) {
            if(creep.memory.targets.length > 1) {
                creep.memory.targets.shift();
            }
        }
        
        movement.moveToRoom(creep, creep.memory.targets[0]);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'discoverer');
