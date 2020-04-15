const movement = require("helper.movement");

module.exports = {
    name: "downgrader",
    configs: function() {
        var configs = [];
        for(let claims = 25; claims >= 5; claims -= 5) {
            let config = Array(claims).fill(CLAIM).concat(Array(claims).fill(MOVE));
            configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        let roomName = creep.memory.room;
        if(!roomName) return;
        if(creep.room.name !== roomName) {
            movement.moveToRoom(creep, roomName);
            return;
        }

        let target = creep.room.controller;
        let result = creep.attackController(target);
        if(result == ERR_NOT_IN_RANGE) {
            creep.goTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'downgrader');
