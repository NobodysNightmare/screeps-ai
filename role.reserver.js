const movement = require("helper.movement");

module.exports = {
    name: "reserver",
    partConfigs: [
        [CLAIM, CLAIM,  MOVE, MOVE],
        [CLAIM, MOVE]
    ],
    run: function(creep) {
        if(creep.room.name != creep.memory.target) {
            movement.moveToRoom(creep, creep.memory.target);
            return;
        }

        if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
};