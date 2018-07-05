const movement = require("helper.movement");

module.exports = {
    name: "claimer",
    parts: [CLAIM, MOVE],
    run: function(creep) {
        let flag = Game.flags[creep.memory.flag];
        if(!flag) return;
        if(creep.room.name != flag.pos.roomName) {
            creep.travelTo(flag, { useFindRoute: true }); // Pathing quickfix (replace with goTo soonish)
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
