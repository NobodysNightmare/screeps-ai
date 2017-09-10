module.exports = {
    name: "flagHunter",
    partConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        var target = Game.flags[creep.memory.flag];
        creep.goTo(target, { debugCosts: true, newPathing: true });
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'flagHunter');
