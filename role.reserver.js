module.exports = {
    name: "reserver",
    partConfigs: [
        [CLAIM, CLAIM,  MOVE, MOVE],
        [CLAIM, MOVE]
    ],
    run: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if(!target) return;

        let result = creep.reserveController(target);
        if(result == OK) {
          if(!target.sign || target.sign.username !== "NobodysNightmare") {
            creep.signController(target, "Owned by Y Pact.");
          }
        } else if(result == ERR_NOT_IN_RANGE) {
            creep.goTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'reserver');
