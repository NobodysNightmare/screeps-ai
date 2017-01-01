module.exports = {
    perform: function(room) {
        if(Game.time % 100 != 0 || room.find(FIND_MY_SPAWNS).length == 0) {
            return;
        }
        
        for(var spawner of room.find(FIND_MY_SPAWNS)) {
            this.buildRoadAround(room, spawner.pos);
            
            for(var source of room.find(FIND_SOURCES)) {
                this.buildRoadAround(room, source.pos);
                this.buildRoadFromTo(room, spawner, source);
            }
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
            room.createConstructionSite(point.x, point.y, STRUCTURE_ROAD);
        }
    },
    buildRoadAround: function(room, position) {
        for(var xOff = -1; xOff <= 1; xOff++) {
            for(var yOff = -1; yOff <= 1; yOff++) {
                if(xOff != 0 || yOff != 0) {
                    room.createConstructionSite(position.x + xOff, position.y + yOff, STRUCTURE_ROAD);
                }
            }
        }
    }
};