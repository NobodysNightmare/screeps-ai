const boosting = require("helper.boosting");
const ff = require("helper.friendFoeRecognition");
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
        if(creep.ticksToLive == CREEP_LIFE_TIME - 1) creep.notifyWhenAttacked(false);

        creep.memory.stopped = false;
        if(creep.room.name === creep.memory.room) {
            if(creep.room.ai() && creep.room.ai().defense.defcon >= 3) {
                if(boosting.accept(creep, "XUH2O")) return;
            } else {
                // Avoid running back to booster after defcon increases
                boosting.decline(creep, "XUH2O");
            }
        } else {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        }

        var target = ff.findHostiles(creep.room)[0];
        if(target) {
            this.attack(creep, target);
        } else {
            let center = creep.room.getPositionAt(25, 25);
            if(creep.pos.getRangeTo(center) > 10) {
                creep.goTo({ pos: center }, { range: 10 });
            } else {
                creep.memory.stopped = true;
            }
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
