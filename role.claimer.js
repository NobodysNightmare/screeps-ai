const movement = require("helper.movement");

module.exports = {
    name: "claimer",
    parts: [CLAIM, MOVE, MOVE], // TODO: how much to move over swamp without issue?
    run: function(creep) {
        let target = AbsolutePosition.deserialize(creep.memory.target);
        if(creep.room.name != target.roomName) {
            creep.goTo(target);
            return;
        }

        target = creep.room.controller;
        let claimResult = creep.claimController(target);
        if(claimResult == OK) {
            if(!target.sign || target.sign.username !== "NobodysNightmare") {
                creep.signController(target, "Owned by Y Pact.");
            }
        } else if(claimResult == ERR_NOT_IN_RANGE) {
            creep.goTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'claimer');
