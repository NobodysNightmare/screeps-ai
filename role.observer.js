const movement = require("helper.movement");

module.exports = {
    name: "observer",
    parts: [TOUGH, MOVE],
    run: function(creep) {
        movement.moveToRoom(creep, creep.memory.target);
    }
};