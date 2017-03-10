module.exports = {
    moveToRoom: function(creep, roomName) {
        creep.moveTo(new RoomPosition(25, 25, roomName));
    },
    leaveExit: function(creep) {
        if(creep.pos.x == 0) {
            creep.move(RIGHT);
        } else if(creep.pos.x == 49) {
            creep.move(LEFT);
        } else if(creep.pos.y == 0) {
            creep.move(BOTTOM);
        } else if(creep.pos.y == 49) {
            creep.move(TOP);
        }
    },
    isOnExit: function(creep) {
        return creep.pos.x == 0 || creep.pos.y == 0 || creep.pos.x == 49 || creep.pos.y == 49;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'movement');
