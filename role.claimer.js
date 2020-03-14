const movement = require("helper.movement");

module.exports = {
    name: "claimer",
    parts: [CLAIM, MOVE, MOVE],
    run: function(creep) {
        let flag = Game.flags[creep.memory.flag];
        if(!flag) return;
        if(creep.room.name != flag.pos.roomName) {
            creep.goTo(flag, { newPathing: true });
            return;
        }

        let target = creep.room.controller;
        let claimResult = creep.claimController(target);
        if(claimResult == OK) {
            if(!target.sign || target.sign.username !== "NobodysNightmare") {
                creep.signController(target, "Owned by Y Pact.");
            }
        } else if(claimResult == ERR_NOT_IN_RANGE) {
            creep.goTo(target, { newPathing: true });
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'claimer');
