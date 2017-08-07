const roadableStructures = [
    STRUCTURE_RAMPART,
    STRUCTURE_CONTAINER
];

module.exports = {
    perform: function(room) {
        let storagePos = room.storagePos();
        if(Game.time % 100 != 0 || !storagePos) {
            return;
        }

        for(let source of room.find(FIND_SOURCES)) {
            this.buildRoadAround(room, source.pos);
            this.buildRoadFromTo(room, storagePos, source.pos);
        }

        this.buildRoadAround(room, room.controller.pos);
        this.buildRoadFromTo(room, storagePos, room.controller.pos);

        if(room.controller.level >= 6) {
            for(let mineral of room.find(FIND_MINERALS)) {
                this.buildRoadFromTo(room, storagePos, mineral.pos);
            }
        }
    },
    buildRoadFromTo: function(room, start, end) {
        let buildings = room.ai().constructions.buildings;
        var path = start.findPathTo(end, { ignoreCreeps: true, costCallback: function(roomName, matrix) {
            for(let building of buildings) {
                building.updateCostMatrix(matrix);
            }
        } });
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
