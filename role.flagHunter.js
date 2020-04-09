module.exports = {
    name: "flagHunter",
    partConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        let target = Game.flags[creep.memory.flag];
        if(creep.memory.targetPosition) {
            target = AbsolutePosition.deserialize(creep.memory.targetPosition);
        }

        if(target) {
            creep.goTo(target);
        } else {
            console.log(`FlagHunter ${creep.name} has no target!`)
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'flagHunter');
