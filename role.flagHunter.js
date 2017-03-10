module.exports = {
    name: "flagHunter",
    partConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        var target = Game.flags[creep.memory.flag];
        creep.moveTo(target, { ignoreDestructibleStructures: creep.memory.ignoreDestructibleStructures });
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'flagHunter');
