const buildings = require("helper.buildings");
const logistic = require("helper.logistic");

function determineStoreType(target, linkAllowed) {
    linkAllowed &&= target.room.storage && target.room.ai().links.storage();
    linkAllowed &&= buildings.available(target.room, STRUCTURE_LINK) > 0;

    if(linkAllowed) {
        return STRUCTURE_LINK;
    } else {
        return STRUCTURE_CONTAINER;
    }
}

// calls callback for all free spaces around target
// aborts iteration when callback returns true.
// Will return true if iteration was aborted early.
function eachSpaceAround(target, callback) {
    let pos = target.pos || target;
    for(let xDir = -1; xDir <= 1; xDir++) {
        for(let yDir = -1; yDir <= 1; yDir++) {
            let x = pos.x + xDir;
            let y = pos.y + yDir;
            if((xDir != 0 || yDir != 0) && target.room.lookForAt(LOOK_TERRAIN, x, y) != "wall") {
                if(callback({ x: x, y: y })) {
                    return true;
                }
            }
        }
    }
}

module.exports = {
    buildNextTo: function(target, linkAllowed) {
        if(logistic.storeFor(target, true)) {
            return;
        }

        let storeType = determineStoreType(target, linkAllowed);
        eachSpaceAround(target, (pos) => this.buildAt(pos, storeType));
    },
    buildWithAccessTo: function(target, linkAllowed) {
        if(logistic.storeFor(target, true)) {
            return;
        }

        let storeType = determineStoreType(target, linkAllowed);
        let that = this;
        eachSpaceAround(target, function(minerPos) {
            return eachSpaceAround(minerPos, (pos) => that.buildAt(pos, storeType));
        });
    },
    buildAt: function(pos, structureType) {
        let result = target.room.createConstructionSite(pos.x, pos.y, structureType);
        return result == OK;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'stores');
