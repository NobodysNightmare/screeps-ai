const boosting = require("helper.boosting");
const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "defender",
    meeleeConfigs: function() {
        let configs = [];
        for(let parts = 25; parts >= 4; parts -= 1) {
            configs.push(spawnHelper.makeParts(parts, ATTACK, parts, MOVE));
        }

        return configs;
    },
    run: function(creep) {
        if(creep.room.name === creep.memory.room) {
            if(boosting.accept(creep, "XUH2O")) return;
        } else {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        }

        var target = Game.getObjectById(creep.room.memory.primaryHostile);
        if(target) {
            this.attack(creep, target);
        } else if(movement.isOnExit(creep)) {
            movement.leaveExit(creep);
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
