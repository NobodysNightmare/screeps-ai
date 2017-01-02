module.exports = {
    perform: function(room) {
        if(Game.time % 100 != 0 || room.find(FIND_MY_SPAWNS).length == 0) {
            return;
        }
        
        if(room.controller) {
            this.buildContainer(room.controller);
        }
        
        for(var source of room.find(FIND_SOURCES)) {
            this.buildContainer(source);
        }
    },
    buildContainer: function(target) {
        if(this.hasContainer(target)) {
            return;
        }
        
        var pos = target.pos;
        for(var xDir = -1; xDir <= 1; xDir++) {
            for(var yDir = -1; yDir <= 1; yDir++) {
                if((xDir == 0 || yDir == 0) && target.room.lookForAt(LOOK_TERRAIN, pos.x + xDir, pos.y + yDir) != "wall") {
                    if(this.buildContainerInDirection(target, xDir, yDir)) {
                        return;
                    }
                }
            }
        }
    },
    hasContainer: function(object) {
        var structures = object.pos.findInRange(FIND_STRUCTURES, 2);
        if(_.any(structures, (r) => r.structureType == STRUCTURE_CONTAINER)) {
            return true;
        }
        
        var constructions = object.pos.findInRange(FIND_CONSTRUCTION_SITES, 2);
        return _.any(constructions, (r) => r.structureType == STRUCTURE_CONTAINER);
    },
    buildContainerInDirection: function(target, xDir, yDir) {
        var pos = target.pos;
        var result = target.room.createConstructionSite(pos.x + xDir * 2, pos.y + yDir * 2, STRUCTURE_CONTAINER)
        return result == OK;
    }
};