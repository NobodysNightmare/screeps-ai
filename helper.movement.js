const inverseDirections = {
    "1": BOTTOM,
    "2": BOTTOM_LEFT,
    "3": LEFT,
    "4": TOP_LEFT,
    "5": TOP,
    "6": TOP_RIGHT,
    "7": RIGHT,
    "8": BOTTOM_RIGHT
};

module.exports = {
    moveToRoom: function(creep, roomName) {
        creep.goTo({ pos: new RoomPosition(25, 25, roomName) }, { range: 10, avoidHostiles: true });
    },
    calculateRoute: function(startRoom, endRoom) {
        let route = Game.map.findRoute(startRoom, endRoom, { routeCallback: routeCallback });
        let walkableRoute = {};
        let from = startRoom.name || startRoom;
        for(let node of route) {
            walkableRoute[from] = node.exit;
            from = node.room;
        }
        return walkableRoute;
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
    },
    getExitRoom: function(creep) {
        let direction = this.getExitDirection(creep);
        if(!direction) return null;

        return Game.map.describeExits(creep.room.name)[direction];
    },
    getExitDirection: function(creep) {
        if(creep.pos.x == 0) return LEFT;
        if(creep.pos.x == 49) return RIGHT;
        if(creep.pos.y == 0) return TOP;
        if(creep.pos.y == 49) return BOTTOM;
        return null;
    },
    inverseDirection: function(direction) {
        return inverseDirections[direction];
    },
    isWithin: function(creep, left, top, right, bottom) {
        let pos = creep.pos;
        return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'movement');
