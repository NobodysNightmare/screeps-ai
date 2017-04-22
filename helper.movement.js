ROUTE_MY_ROOM_COST = 1;
ROUTE_NEUTRAL_ROOM_COST = 2;
ROUTE_HOSTILE_ROOM_COST = 4;
ROUTE_HIGHWAY_ROOM_COST = 1.5;

const roomNameRegex = /^[EW]([0-9]+)[NS]([0-9]+)$/;

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

        let route = creep.memory._route.route;
        if(route[creep.room.name]) {
            // TODO: calculate complete path using findPath and this macro route
            creep.moveTo(creep.pos.findClosestByRange(route[creep.room.name]));
        } else {
            if(creep.room.name !== roomName) {
                console.log(creep.name + ": Not on route! " + creep.room.name + " => " + roomName);
            }
            creep.moveTo(new RoomPosition(25, 25, roomName));
        }
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
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'movement');
