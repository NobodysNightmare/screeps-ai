const roadableStructures = [
    STRUCTURE_RAMPART,
    STRUCTURE_CONTAINER
];

module.exports = {
    perform: function(room) {
        let spawner = room.find(FIND_MY_SPAWNS)[0];
        if(Game.time % 100 != 0 || !spawner) {
            return;
        }
        
        for(var source of room.find(FIND_SOURCES)) {
            this.buildRoadAround(room, source.pos);
            this.buildRoadFromTo(room, spawner, source);
        }
        
        if(room.controller) {
            this.buildRoadAround(room, room.controller.pos);
            var target = room.controller.pos.findClosestByRange(FIND_SOURCES);
            if(target) {
                this.buildRoadFromTo(room, room.controller, target);
            }
        }
    },
    buildRoadFromTo: function(room, start, end) {
        var path = start.pos.findPathTo(end, { ignoreCreeps: true, ignoreRoads: true });
        for(var point of path) {
            this.buildRoad(new RoomPosition(point.x, point.y, room.name));
        }
    },
    buildRoadAround: function(room, position) {
        for(var xOff = -1; xOff <= 1; xOff++) {
            for(var yOff = -1; yOff <= 1; yOff++) {
                if(xOff != 0 || yOff != 0) {
                    this.buildRoad(new RoomPosition(position.x + xOff, position.y + yOff, room.name));
                }
            }
        }
    },
    buildRoad: function(position) {
        if(_.any(position.lookFor(LOOK_STRUCTURES), (s) => !roadableStructures.includes(s.structureType))) return;
        position.createConstructionSite(STRUCTURE_ROAD);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roads');