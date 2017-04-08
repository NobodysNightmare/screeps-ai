const movement = require("helper.movement");

module.exports = {
    name: "defender",
    meeleeConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        if(creep.room.name !== creep.memory.room) {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        }

        var target = Game.getObjectById(creep.room.memory.primaryHostile);
        if(target) {
            this.attack(creep, target);
        }
    },
    attack: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { maxRooms: 1 });
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'defender');
