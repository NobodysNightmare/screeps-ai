module.exports = class BuildProxy {
    constructor(room) {
        this.room = room;
        this.plan = new Map();
    }

    planConstruction(x, y, structureType) {
        let pos = { x: x, y: y };
        if(this.plan.has(pos)) return false;

        this.plan.set(pos, structureType);
        return true;
    }

    commit() {
        for(let posAndType of this.plan) {
            let pos = posAndType[0];
            let structureType = posAndType[1];

            this.room.createConstructionSite(pos.x, pos.y, structureType);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'BuildProxy');
