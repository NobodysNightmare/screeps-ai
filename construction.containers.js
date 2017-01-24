var logistic = require("helper.logistic");

module.exports = {
    buildNear: function(target) {
        if(logistic.storeFor(target, true)) {
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
    buildContainerInDirection: function(target, xDir, yDir) {
        var pos = target.pos;
        var result = target.room.createConstructionSite(pos.x + xDir * 2, pos.y + yDir * 2, STRUCTURE_CONTAINER)
        return result == OK;
    }
};