module.exports = {
    name: "claimer",
    parts: [CLAIM, MOVE],
    run: function(creep) {
        let flag = Game.flags.claim;
        if(!flag) return;
        if(creep.room.name != flag.pos.roomName) {
            creep.moveTo(flag);
            return;
        }

        let target = creep.room.controller;
        let claimResult = creep.claimController(target);
        if(claimResult == OK) {
            if(!target.sign || target.sign.username !== "NobodysNightmare") {
                creep.signController(target, "Owned by Y Pact.");
            }
        } else if(claimResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'claimer');
