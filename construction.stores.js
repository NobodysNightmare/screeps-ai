const buildings = require("helper.buildings");
const logistic = require("helper.logistic");

module.exports = {
    buildNextTo: function(target, linkAllowed) {
        if(logistic.storeFor(target, true)) {
            return;
        }

        linkAllowed &&= target.room.storage && target.room.ai().links.storage();
        linkAllowed &&= buildings.available(target.room, STRUCTURE_LINK) > 0;

        let structureType = STRUCTURE_CONTAINER;
        if(linkAllowed) {
            structureType = STRUCTURE_LINK;
        }

        var pos = target.pos;
        for(var xDir = -1; xDir <= 1; xDir++) {
            for(var yDir = -1; yDir <= 1; yDir++) {
                if((xDir != 0 || yDir != 0) && target.room.lookForAt(LOOK_TERRAIN, pos.x + xDir, pos.y + yDir) != "wall") {
                    if(this.buildInDirection(target, xDir, yDir, structureType)) {
                        return;
                    }
                }
            }
        }
    },
    buildInDirection: function(target, xDir, yDir, structureType) {
        let pos = target.pos;
        let result = target.room.createConstructionSite(pos.x + xDir, pos.y + yDir, structureType);
        return result == OK;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'stores');
