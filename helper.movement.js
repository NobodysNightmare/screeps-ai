ROUTE_MY_ROOM_COST = 1;
ROUTE_NEUTRAL_ROOM_COST = 2;
ROUTE_HOSTILE_ROOM_COST = 4;
ROUTE_HIGHWAY_ROOM_COST = 1.5;

const roomNameRegex = /^[EW]([0-9]+)[NS]([0-9]+)$/;
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

function routeCallback(roomName, fromRoomName) {
    let room = Game.rooms[roomName];
    let match = roomNameRegex.exec(roomName);

    if(room && room.controller && room.controller.my) return ROUTE_MY_ROOM_COST;
    if(match[1].endsWith("0") || match[2].endsWith("0")) return ROUTE_HIGHWAY_ROOM_COST;
    return ROUTE_NEUTRAL_ROOM_COST;
}

module.exports = {
    moveToRoom: function(creep, roomName) {
        if(!creep.memory._route || creep.memory._route.target !== roomName) {
            creep.memory._route = {
                target: roomName,
                route: this.calculateRoute(creep.room, roomName)
            }
        }

        // TODO: use calculated route in pathfinder to block rooms
        // using the route without pathfinder is too buggy (e.g. navigating to the wrong exit tile)
        creep.moveTo(new RoomPosition(25, 25, roomName));
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
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'movement');
