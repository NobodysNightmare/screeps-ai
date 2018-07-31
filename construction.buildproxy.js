function serializePos(x, y) {
    return x + "|" + y;
}

function deserializePos(string) {
    let parts = string.split("|");
    return { x: parseInt(parts[0]), y: parseInt(parts[1]) };
}

module.exports = class BuildProxy {
    constructor(room) {
        this.room = room;
        this.plan = {}
    }

    planConstruction(x, y, structureType) {
        let posString = serializePos(x, y);
        if(this.plan[posString]) return false;

        this.plan[posString] = structureType;
        return true;
    }

    commit() {
        for(let posString in this.plan) {
            let structureType = this.plan[posString];
            let pos = deserializePos(posString);

            this.room.createConstructionSite(pos.x, pos.y, structureType);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'BuildProxy');
