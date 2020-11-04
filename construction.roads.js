const roadableStructures = [
    STRUCTURE_RAMPART,
    STRUCTURE_CONTAINER
];

module.exports = {
    buildRoadFromTo: function(room, start, end) {
        let buildings = room.ai().constructions.buildings;
        var path = start.findPathTo(end, { ignoreCreeps: true, ignoreRoads: true, costCallback: function(roomName, matrix) {
            for(let building of buildings) {
                building.updateCostMatrix(matrix);
            }
        } });

        // remove target from path (road does not need to end ON target)
        path.pop();

        for(var point of path) {
            this.buildRoad(new RoomPosition(point.x, point.y, room.name));
        }
    },
    buildRoadAround: function(room, position) {
        let terrain = room.getTerrain();
        for(var xOff = -1; xOff <= 1; xOff++) {
            for(var yOff = -1; yOff <= 1; yOff++) {
                if(xOff != 0 || yOff != 0) {
                    if(terrain.get(position.x + xOff, position.y + yOff) !== TERRAIN_MASK_WALL) {
                        this.buildRoad(new RoomPosition(position.x + xOff, position.y + yOff, room.name));
                    }
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
